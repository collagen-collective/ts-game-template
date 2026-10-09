<!-- For someone outside the session: coming to this branch cold, or back to it after a while. It says why the work was done, what is now settled and why, and what is still open, in the words they would use. What is settled is a black box: how it works and how it got there are in the commit log and the design log, for whoever returns to that part of the game. Every sentence is one that reader needs now. -->

## What changed

<!-- Why this PR exists, which is most of this section: the goal it served and where the work started (a plan, a report, a playtest). Then, in a paragraph or two, what a player can now do that they could not (for tooling, what an agent session can), as they would notice it rather than how it works: "Shores slope more gently now, which moved a few docks", not "The shore uses a falloff curve (a1b2c3d), which moved seed 12's dock, so the dock tests moved to seed 30 (d4e5f6a)." Things are called what a newcomer to the game would call them, not by the code's or the session's names for them. Merges of main, tests moved or mended, and calls made along the way are the logs'. A commit is named only where a reader may need to revert it. -->

## Needs a person

<!-- Charter changes, questions of how something feels, and decisions this is waiting on, each in a sentence or two: the question, and only what it takes to answer it. "Night as the default came up but isn't done yet. Here, or in its own PR?" How a question came up, what doing it would cost, and where to look are the design log's, unless the answer turns on them. A decision already made is said with its reason ("`?fog=off` is gone, since fog on was chosen"), not with the history of how it was made. "Nothing" is an answer. -->

## Played

<!-- How the sittings went, in a sentence: how many, and whether they brought back a lot or a little. Then the few things play changed most, each told as why in a sentence or two: "The first boats turned on the spot, which didn't feel like sailing, so a boat now has to be moving to turn." Not each sitting, each rebuild, or each thing that worked. If not yet played, what someone playing it should look at. -->

## Measured

<!-- The few numbers a reader needs now: those an open question or a decision here rests on, and any cost the change brings, each with what it means and where it was taken: "An island takes 4 s to build, up from 2 s (Node, seeds 1–10): the price of the new shores", not a table of every count taken along the way. Settled checks are the design log's. Telemetry, not how it feels. "Nothing" is an answer. -->

## Verification

<!-- How the final run went: `npm run verify` on the last commit, and CI's result, read after the push. An earlier run is here only if it left something open, such as a failure that went away with no cause found. A failure found and fixed along the way, and the check that each new test fails without its fix, are the design log's. -->

## Not in this PR

<!-- What was left out, or found and not fixed, and why. -->
