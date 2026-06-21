/** Tema disponível no catálogo, espelhando `GET /interests/catalog`. */
export interface InterestTopic {
  slug: string;
  label: string;
}

/** Interesses do usuário, espelhando `GET`/`PUT /me/interests`. */
export interface UserInterests {
  interests: string[];
}
