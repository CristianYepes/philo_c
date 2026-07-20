/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 17:18:39 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:25:48 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

static int	init_philos(t_table *table)
{
	table->philos = malloc(sizeof(t_philo) * table->philo_nbr);
	table->threads = malloc(sizeof(pthread_t) * table->philo_nbr);
	if (!table->philos || !table->threads)
	{
		if (table->philos)
			free(table->philos);
		if (table->threads)
			free(table->threads);
		return (1);
	}
	if (fill_philo_data(table) != 0)
	{
		free(table->philos);
		table->philos = NULL;
		free(table->threads);
		table->threads = NULL;
		return (1);
	}
	return (0);
}

static int	init_control_mutexes(t_table *table)
{
	if (pthread_mutex_init(&table->write_lock, NULL) != 0)
		return (1);
	if (pthread_mutex_init(&table->stop_lock, NULL) != 0)
	{
		pthread_mutex_destroy(&table->write_lock);
		return (1);
	}
	return (0);
}

static int	init_mutexes(t_table *table)
{
	int	i;

	i = 0;
	table->forks = malloc(sizeof(pthread_mutex_t) * table->philo_nbr);
	if (!table->forks)
		return (1);
	while (i < table->philo_nbr)
	{
		if (pthread_mutex_init(&table->forks[i], NULL) != 0)
		{
			while (--i >= 0)
				pthread_mutex_destroy(&table->forks[i]);
			free(table->forks);
			return (1);
		}
		i++;
	}
	if (init_control_mutexes(table) != 0)
	{
		while (--i >= 0)
			pthread_mutex_destroy(&table->forks[i]);
		free(table->forks);
		return (1);
	}
	return (0);
}

static t_table	*init_args(int argc, char *argv[])
{
	t_table	*table;

	table = malloc(sizeof(t_table));
	if (!table)
		return (NULL);
	table->philo_nbr = ft_atol(argv[1]);
	table->time_to_die = ft_atol(argv[2]);
	table->time_to_eat = ft_atol(argv[3]);
	table->time_to_sleep = ft_atol(argv[4]);
	if (argc == 6)
		table->nbr_limit_meals = ft_atol(argv[5]);
	else
		table->nbr_limit_meals = -1;
	table->sim_stop = false;
	table->threads_ready = false;
	table->start_time = 0;
	table->philos = NULL;
	table->forks = NULL;
	table->threads = NULL;
	return (table);
}

t_table	*init_table(int argc, char *argv[])
{
	t_table	*table;

	table = init_args(argc, argv);
	if (!table)
		return (NULL);
	if (init_mutexes(table) != 0)
	{
		free(table);
		return (NULL);
	}
	if (init_philos(table) != 0)
	{
		ft_destroy_all(table);
		free(table);
		return (NULL);
	}
	return (table);
}
