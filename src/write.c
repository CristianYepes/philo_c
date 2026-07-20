/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   write.c                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/06 01:15:10 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 01:30:18 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

void	write_status(t_philo *philo, char *status)
{
	long	time_passed;

	time_passed = get_time() - philo->table->start_time;
	pthread_mutex_lock(&philo->table->write_lock);
	pthread_mutex_lock(&philo->table->stop_lock);
	if (philo->table->sim_stop == true && status[0] != 'd')
	{
		pthread_mutex_unlock(&philo->table->stop_lock);
		pthread_mutex_unlock(&philo->table->write_lock);
		return ;
	}
	pthread_mutex_unlock(&philo->table->stop_lock);
	printf("%ld %ld %s\n", time_passed, philo->id, status);
	pthread_mutex_unlock(&philo->table->write_lock);
}
