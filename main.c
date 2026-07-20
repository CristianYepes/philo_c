/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/01 20:07:15 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 17:23:12 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

static bool	join_threads(t_table *table, pthread_t monitor_thread)
{
	int	i;

	if (pthread_join(monitor_thread, NULL) != 0)
		return (false);
	i = 0;
	while (i < table->philo_nbr)
	{
		if (pthread_join(table->threads[i], NULL) != 0)
			return (false);
		i++;
	}
	return (true);
}

static void	sync_start_time(t_table *table)
{
	int	i;

	table->start_time = get_time();
	i = 0;
	while (i < table->philo_nbr)
	{
		table->philos[i].last_meal_time = table->start_time;
		i++;
	}
}

static bool	start_threads(t_table *table, pthread_t *monitor_thread)
{
	int	i;

	i = 0;
	while (i < table->philo_nbr)
	{
		if (pthread_create(&table->threads[i], NULL,
				philo_routine, &table->philos[i]) != 0)
		{
			set_sim_stop_flag(table, true);
			set_threads_ready(table, true);
			while (--i >= 0)
				pthread_join(table->threads[i], NULL);
			return (false);
		}
		i++;
	}
	if (pthread_create(monitor_thread, NULL, monitor_routine, table) != 0)
	{
		set_sim_stop_flag(table, true);
		set_threads_ready(table, true);
		while (--i >= 0)
			pthread_join(table->threads[i], NULL);
		return (false);
	}
	return (true);
}

static bool	start_simulation(t_table *table)
{
	pthread_t	monitor_thread;

	if (!start_threads(table, &monitor_thread))
		return (false);
	sync_start_time(table);
	set_threads_ready(table, true);
	return (join_threads(table, monitor_thread));
}

int	main(int argc, char **argv)
{
	t_table	*table;

	if (argc < 5 || argc > 6)
		return (ft_error_exit("Invalid arguments"));
	if (!check_args(argc, argv))
	{
		ft_error_exit("Invalid arguments");
		return (1);
	}
	table = init_table(argc, argv);
	if (!table)
		return (1);
	if (!start_simulation(table))
	{
		ft_destroy_all(table);
		free(table);
		return (1);
	}
	ft_destroy_all(table);
	free(table);
	return (0);
}
