/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   parsing.c                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: cyepes <cyepes@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 01:21:48 by cyepes            #+#    #+#             */
/*   Updated: 2026/02/06 16:45:00 by cyepes           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "philo.h"

static int	ft_is_digit(char c)
{
	if (c >= '0' && c <= '9')
	{
		return (1);
	}
	return (0);
}

static int	ft_is_space(char c)
{
	if (c == ' ' || (c >= 9 && c <= 13))
	{
		return (1);
	}
	return (0);
}

static const char	*valid_input(const char *str)
{
	int	i;
	int	len;

	i = 0;
	len = 0;
	while (ft_is_space(str[i]))
		i++;
	if (str[i] == '+')
		i++;
	else if (str[i] == '-')
		return (NULL);
	if (!ft_is_digit(str[i]))
		return (NULL);
	while (ft_is_digit(str[i]))
	{
		i++;
		len++;
	}
	while (str[i] && ft_is_space(str[i]))
		i++;
	if (len > 10 || str[i] != '\0')
		return (NULL);
	return (str);
}

long	ft_atol(const char *str)
{
	long	result;
	int		i;
	int		digit;

	result = 0;
	i = 0;
	while (ft_is_space(str[i]))
		i++;
	if (str[i] == '+')
		i++;
	while (ft_is_digit(str[i]))
	{
		digit = str[i] - '0';
		if (result > (LONG_MAX - digit) / 10)
			return (LONG_MAX);
		result = result * 10 + digit;
		i++;
	}
	return (result);
}

bool	check_args(int argc, char **argv)
{
	int		i;
	long	num;

	i = 1;
	while (i < argc)
	{
		if (valid_input(argv[i]) == NULL)
			return (false);
		num = ft_atol(argv[i]);
		if (num > INT_MAX || num == 0)
			return (false);
		i++;
	}
	return (true);
}
