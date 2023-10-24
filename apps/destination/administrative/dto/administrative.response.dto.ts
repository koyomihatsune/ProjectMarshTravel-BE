export type SingleAdministrativeResponseDTO = {
  code: string;
  name: string;
  name_en: string;
  explore_tags: string[];
  imageURL: string;
  followed?: boolean;
  type?: string;
};
