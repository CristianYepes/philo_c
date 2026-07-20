/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   routine.c                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/06 01:58:34 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 17:02:36 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

void	philo_think(t_philo *philo)
{
	long	time_to_think;

	write_status(philo, MSG_THINKING);
	if (philo->table->philo_nbr % 2 == 0)
		return ;
	if (philo->table->time_to_eat >= philo->table->time_to_sleep)
	{
		time_to_think = philo->table->time_to_eat
			- philo->table->time_to_sleep;
		ft_usleep(time_to_think + 5, philo->table);
	}
}

void	philo_sleep(t_philo *philo)
{
	write_status(philo, MSG_SLEEPING);
	ft_usleep(philo->table->time_to_sleep, philo->table);
}

void	*philo_routine(void *ptr)
{
	t_philo	*philo;

	philo = (t_philo *)ptr;
	while (!all_threads_running(philo->table))
		usleep(1000);
	if (philo->table->philo_nbr == 1)
	{
		philo_eat(philo);
		return (NULL);
	}
	if (philo->id % 2 == 0)
		ft_usleep(20, philo->table);
	while (!has_simulation_stopped(philo->table))
	{
		philo_eat(philo);
		philo_sleep(philo);
		philo_think(philo);
	}
	return (NULL);
}
