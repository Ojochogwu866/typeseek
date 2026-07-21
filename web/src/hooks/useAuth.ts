import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getCurrentUser,
	login,
	logout,
	signup,
	type AuthUser,
} from '../api/auth';

const AUTH_QUERY_KEY = ['auth', 'me'];

export function useAuth() {
	const queryClient = useQueryClient();

	const userQuery = useQuery({
		queryKey: AUTH_QUERY_KEY,
		queryFn: getCurrentUser,
	});

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: (user) =>
			queryClient.setQueryData<AuthUser>(AUTH_QUERY_KEY, user),
	});

	const signupMutation = useMutation({
		mutationFn: signup,
		onSuccess: (user) =>
			queryClient.setQueryData<AuthUser>(AUTH_QUERY_KEY, user),
	});

	const logoutMutation = useMutation({
		mutationFn: logout,
		onSuccess: () =>
			queryClient.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, null),
	});

	return {
		user: userQuery.data ?? null,
		login: loginMutation,
		signup: signupMutation,
		logout: logoutMutation,
	};
}
