/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   monitor_utils.c                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/06 13:53:57 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:51:59 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

bool	check_philo_death(t_philo *philo)
{
	long	time;
	long	time_to_die;

	if (has_simulation_stopped(philo->table))
		return (false);
	pthread_mutex_lock(&philo->meal_lock);
	time = get_time() - philo->last_meal_time;
	time_to_die = philo->table->time_to_die;
	pthread_mutex_unlock(&philo->meal_lock);
	if (time > time_to_die)
	{
		return (true);
	}
	return (false);
}

bool	check_all_ate(t_table *table)
{
	int	i;
	int	finished_eating;

	i = 0;
	finished_eating = 0;
	if (table->nbr_limit_meals == -1)
		return (false);
	while (i < table->philo_nbr)
	{
		pthread_mutex_lock(&table->philos[i].meal_lock);
		if (table->philos[i].meals_eaten >= table->nbr_limit_meals)
			finished_eating++;
		pthread_mutex_unlock(&table->philos[i].meal_lock);
		i++;
	}
	if (finished_eating == table->philo_nbr)
	{
		set_sim_stop_flag(table, true);
		return (true);
	}
	return (false);
}

bool	scan_death(t_table *table)
{
	int	i;

	i = 0;
	while (i < table->philo_nbr && !has_simulation_stopped(table))
	{
		if (check_philo_death(&table->philos[i]))
		{
			set_sim_stop_flag(table, true);
			write_status(&table->philos[i], MSG_DEAD);
			return (true);
		}
		i++;
	}
	return (false);
}
