/**
 * What this game's feedback function is called and where it sends reports:
 * the only part of `infra/` a project fills in for itself. Everything else
 * here is the same for every game (README, *Feedback from inside the game*).
 * A synth refuses the placeholders, so nothing is deployed with one left in.
 */
export const config = {
    /** The CloudFormation stack, and the start of every name in it: `MyGameFeedback`, say. */
    stack: "<Game>Feedback",
    /** The AWS region it is deployed to: `us-east-2`, say. */
    region: "<region>",
    /** The private repository reports are committed to, and its branch. */
    inbox: { repo: "<owner>/<game>-feedback", branch: "main" },
    /**
     * The game's address, which the function's CORS lets read its answers: the
     * hosted game's origin, with no slash at the end. More than one may be
     * given, a second branch's site say.
     */
    origins: ["https://<the hosted game's address>"],
    /** How long the function's log is kept, in days. */
    logDays: 90,
};
