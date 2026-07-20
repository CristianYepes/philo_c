/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_utils.c                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/06 00:28:58 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:23:25 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

static void	assign_forks(t_philo *philo, pthread_mutex_t *forks, int pos)
{
	int	philo_nbr;

	philo_nbr = philo->table->philo_nbr;
	if (philo->id % 2 == 0)
	{
		philo->first_fork = &forks[pos];
		philo->second_fork = &forks[(pos + 1) % philo_nbr];
	}
	else
	{
		philo->first_fork = &forks[(pos + 1) % philo_nbr];
		philo->second_fork = &forks[pos];
	}
}

int	fill_philo_data(t_table *table)
{
	int	i;

	i = 0;
	while (i < table->philo_nbr)
	{
		table->philos[i].id = i + 1;
		table->philos[i].meals_eaten = 0;
		table->philos[i].last_meal_time = table->start_time;
		table->philos[i].table = table;
		if (pthread_mutex_init(&table->philos[i].meal_lock, NULL) != 0)
		{
			while (--i >= 0)
				pthread_mutex_destroy(&table->philos[i].meal_lock);
			return (1);
		}
		assign_forks(&table->philos[i], table->forks, i);
		i++;
	}
	return (0);
}
