/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   monitor.c                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/06 02:17:32 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:38:48 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

void	set_sim_stop_flag(t_table *table, bool state)
{
	pthread_mutex_lock(&table->stop_lock);
	table->sim_stop = state;
	pthread_mutex_unlock(&table->stop_lock);
}

bool	has_simulation_stopped(t_table *table)
{
	bool	res;

	pthread_mutex_lock(&table->stop_lock);
	res = table->sim_stop;
	pthread_mutex_unlock(&table->stop_lock);
	return (res);
}

void	set_threads_ready(t_table *table, bool state)
{
	pthread_mutex_lock(&table->stop_lock);
	table->threads_ready = state;
	pthread_mutex_unlock(&table->stop_lock);
}

bool	all_threads_running(t_table *table)
{
	bool	res;

	pthread_mutex_lock(&table->stop_lock);
	res = table->threads_ready;
	pthread_mutex_unlock(&table->stop_lock);
	return (res);
}

void	*monitor_routine(void *ptr)
{
	t_table	*table;
	int		check_meals_frequency;

	table = (t_table *)ptr;
	check_meals_frequency = 0;
	while (!all_threads_running(table))
		usleep(1000);
	while (!has_simulation_stopped(table))
	{
		if (scan_death(table))
			return (NULL);
		if (check_meals_frequency >= 10)
		{
			check_all_ate(table);
			check_meals_frequency = 0;
		}
		check_meals_frequency++;
		usleep(1000);
	}
	return (NULL);
}
