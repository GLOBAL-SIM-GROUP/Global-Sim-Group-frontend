/**
 * Contrat WebSocket (Socket.IO, namespace `/notifications`) — cf. backend.
 * Aucun endpoint REST n'existe ni n'existera pour les notifications : tout
 * passe par ce socket (historique court côté Redis, pas de table SQL).
 */

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Enveloppe reçue via `notifications:history` (liste) et `notification` (unité). */
export interface NotificationEnvelope {
	/** Identifiant unique — clé React et clé de dédoublonnage. */
	id: string;
	/** Ex. "signalement.resolu", "pressing.commande_prete". */
	event: string;
	priority: NotificationPriority;
	/** ISO 8601. */
	timestamp: string;
	/** Payload spécifique à l'événement — ne pas en dériver l'affichage. */
	data: Record<string, unknown>;
	/** Texte déjà formaté par le backend — toujours utiliser tel quel. */
	message: { title: string; body: string };
	recipients: { rooms: string[]; userIds: string[] };
}

/** Utilisateur tel que renvoyé par `connection:ok` (debug/affichage). */
export interface NotificationConnectionUser {
	id: string;
	login: string;
	role: string;
	idCaisse?: string | null;
	idActiviteScope?: string | null;
	permissions: string[];
}

export interface NotificationConnectionOk {
	user: NotificationConnectionUser;
	rooms: string[];
}
