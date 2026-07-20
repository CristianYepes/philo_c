/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   philo.h                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/01 19:50:06 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/07 02:32:53 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef PHILO_H
# define PHILO_H

# include <limits.h>
# include <pthread.h>
# include <stdbool.h>
# include <stdio.h>
# include <stdlib.h>
# include <sys/time.h>
# include <unistd.h>

# define MSG_EATING "is eating"
# define MSG_SLEEPING "is sleeping"
# define MSG_THINKING "is thinking"
# define MSG_DEAD "died"
# define MSG_FORK "has taken a fork"

typedef struct s_philo	t_philo;
typedef struct s_table
{
	long			philo_nbr;
	long			time_to_die;
	long			time_to_eat;
	long			time_to_sleep;
	long			nbr_limit_meals;
	long			start_time;
	pthread_mutex_t	*forks;
	t_philo			*philos;
	pthread_t		*threads;
	pthread_mutex_t	write_lock;
	pthread_mutex_t	stop_lock;
	bool			sim_stop;
	bool			threads_ready;
}	t_table;
typedef struct s_philo
{
	t_table			*table;
	pthread_mutex_t	*first_fork;
	pthread_mutex_t	*second_fork;
	long			last_meal_time;
	long			meals_eaten;
	long			id;
	pthread_mutex_t	meal_lock;
}	t_philo;

// UTILS
int		ft_error_exit(char *str);
void	ft_destroy_all(t_table *table);
// PARSING
long	ft_atol(const char *str);
bool	check_args(int argc, char **argv);
// TIME
long	get_time(void);
void	ft_usleep(long milliseconds, t_table *table);
// INIT
t_table	*init_table(int argc, char *argv[]);
// INIT_UTILS
int		fill_philo_data(t_table *table);
// WRITE
void	write_status(t_philo *philo, char *status);
// EAT
void	philo_eat(t_philo *philo);
// MONITOR
void	set_sim_stop_flag(t_table *table, bool state);
bool	has_simulation_stopped(t_table *table);
void	set_threads_ready(t_table *table, bool state);
bool	all_threads_running(t_table *table);
void	*monitor_routine(void *ptr);
// MONITOR_UTILS
bool	check_philo_death(t_philo *philo);
bool	check_all_ate(t_table *table);
bool	scan_death(t_table *table);
// ROUTINE
void	philo_think(t_philo *philo);
void	philo_sleep(t_philo *philo);
void	*philo_routine(void *ptr);
#endif
