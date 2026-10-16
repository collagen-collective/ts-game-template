import { randomUUID } from "node:crypto";
import {
    GetSecretValueCommand,
    PutSecretValueCommand,
    SecretsManagerClient,
    UpdateSecretVersionStageCommand,
} from "@aws-sdk/client-secrets-manager";

/** Publish only if AWSCURRENT still names the version this command read. */
export async function replaceSecret(
    sm: SecretsManagerClient,
    secretId: string,
    previousVersionId: string | undefined,
    settings: string,
): Promise<void> {
    if (!previousVersionId)
        throw new Error(
            "The secret had no version ID; it cannot be updated safely. Nothing changed.",
        );

    const candidateId = randomUUID();
    const stage = `feedback-update-${candidateId}`;
    try {
        await sm.send(
            new PutSecretValueCommand({
                SecretId: secretId,
                ClientRequestToken: candidateId,
                SecretString: settings,
                // Omitting stages would publish stale settings before the check below.
                VersionStages: [stage],
            }),
        );
        try {
            await sm.send(
                new UpdateSecretVersionStageCommand({
                    SecretId: secretId,
                    VersionStage: "AWSCURRENT",
                    MoveToVersionId: candidateId,
                    // AWS rejects the move when this version no longer holds AWSCURRENT;
                    // a separate read/check followed by PutSecretValue is not atomic.
                    RemoveFromVersionId: previousVersionId,
                }),
            );
        } catch (error) {
            const current = await sm
                .send(
                    new GetSecretValueCommand({
                        SecretId: secretId,
                        VersionStage: "AWSCURRENT",
                    }),
                )
                .catch(() => undefined);
            // A lost response followed by an SDK retry can report a failed move
            // after our candidate was already published. Do not ask for a retry.
            if (current?.VersionId !== candidateId) {
                if (current?.VersionId && current.VersionId !== previousVersionId)
                    throw new Error(
                        "The settings changed while this command was running; the current settings were kept. Run this command again.",
                        { cause: error },
                    );
                throw error;
            }
        }
    } finally {
        try {
            await sm.send(
                new UpdateSecretVersionStageCommand({
                    SecretId: secretId,
                    VersionStage: stage,
                    RemoveFromVersionId: candidateId,
                }),
            );
        } catch (error) {
            // A failed Put may not have created the version at all.
            // Cleanup must never turn an already-published change into a failed
            // command: retrying a key rotation would revoke the link just given.
            if ((error as Error).name !== "ResourceNotFoundException")
                console.warn(
                    `The temporary staging label ${stage} could not be removed from ${secretId}. Remove that label in Secrets Manager; it does not affect the active settings.`,
                );
        }
    }
}
