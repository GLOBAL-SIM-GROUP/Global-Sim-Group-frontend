import { useMutation } from "@tanstack/react-query";
import { getApiClient } from "./index";

export interface UploadImageResult {
	key: string;
}

export function useUploadImage() {
	return useMutation({
		mutationFn: async (file: File): Promise<UploadImageResult> => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("categorie", "produit-photo");

			const response = await getApiClient().uploadForm<UploadImageResult>(
				"/api/v1/uploads",
				{
					method: "POST",
					body: formData,
				},
			);

			return response;
		},
	});
}
