"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError, api } from "@todo/api-client";
import type { CreateUserRequest } from "@todo/types";
import { toast } from "sonner";

export function useCreateUser() {
	return useMutation({
		mutationFn: (body: CreateUserRequest) => api.createUser(body),
		onError: (error) => {
			const description =
				error instanceof ApiError && error.status === 409
					? "その名前のユーザーはもういます。"
					: error.message;
			toast.error("ユーザーを作れませんでした", { description });
		},
	});
}
