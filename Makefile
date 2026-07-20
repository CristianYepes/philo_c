# ============================================================================== #
#                                  PHILOSOPHERS                                  #
# ============================================================================== #

NAME 		= philo
CC 			= cc
CFLAGS 		= -Wall -Wextra -Werror -pthread
INC 		= -I./includes

SRC 		=	main.c \
				src/utils.c \
				src/parsing.c \
				src/time.c \
				src/init.c \
				src/init_utils.c \
				src/write.c \
				src/eat.c \
				src/monitor.c \
				src/monitor_utils.c \
				src/routine.c \

OBJ_PATH 	= obj/
OBJS 		= $(addprefix $(OBJ_PATH), $(SRC:.c=.o))

all: $(NAME)

$(OBJ_PATH)%.o: %.c
	@mkdir -p $(dir $@)
	@echo "\033[0;33mCompiling $< ...\033[0m"
	@$(CC) $(CFLAGS) -c $< -o $@ $(INC)

$(NAME) : $(OBJS)
	@echo "\033[1;34mCompiling Philo\033[0m"
	@$(CC) $(CFLAGS) -o $(NAME) $(OBJS) $(INC)
	@echo "\033[1;32m Philo compiled successfully!\033[0m"

clean:
	@echo "\033[1;31mRemoving .o object files...\033[0m"
	@rm -rf $(OBJ_PATH)

fclean: clean
	@echo "\033[1;31mRemoving philo...\033[0m"
	@rm -f $(NAME)

re: fclean all

.PHONY: all re clean fclean
