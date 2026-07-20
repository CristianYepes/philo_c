/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   time.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 16:27:47 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:22:02 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

long	get_time(void)
{
	struct timeval	tv;

	if (gettimeofday(&tv, NULL))
		return (-1);
	return ((tv.tv_sec * 1000) + (tv.tv_usec / 1000));
}

void	ft_usleep(long milliseconds, t_table *table)
{
	long	start;
	long	time;
	long	rem;

	start = get_time();
	while ((get_time() - start) < milliseconds)
	{
		if (has_simulation_stopped(table))
			break ;
		time = get_time() - start;
		rem = milliseconds - time;
		if (rem > 1)
			usleep(500);
		else
		{
			while ((get_time() - start) < milliseconds)
				;
		}
	}
}
