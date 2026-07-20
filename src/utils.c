/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   utils.c                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/01 20:21:01 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:22:52 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

static int	ft_strlen(char *str)
{
	int	i;

	i = 0;
	while (str[i])
	{
		i++;
	}
	return (i);
}

int	ft_error_exit(char *str)
{
	write(2, "Error: ", 7);
	write(2, str, ft_strlen(str));
	write(2, "\n", 1);
	return (1);
}

static void	cleanup_philos(t_table *table)
{
	int	i;

	i = 0;
	if (!table->philos)
		return ;
	while (i < table->philo_nbr)
	{
		pthread_mutex_destroy(&table->philos[i].meal_lock);
		i++;
	}
	free(table->philos);
}

static void	cleanup_mutexes(t_table *table)
{
	int	i;

	i = 0;
	if (table->forks)
	{
		while (i < table->philo_nbr)
		{
			pthread_mutex_destroy(&table->forks[i]);
			i++;
		}
		free(table->forks);
	}
	pthread_mutex_destroy(&table->write_lock);
	pthread_mutex_destroy(&table->stop_lock);
}

void	ft_destroy_all(t_table *table)
{
	if (!table || table->philo_nbr <= 0)
	{
		return ;
	}
	cleanup_mutexes(table);
	cleanup_philos(table);
	if (table->threads)
	{
		free(table->threads);
	}
	return ;
}
