# RPG character builds

Reference copies of two live ourdream.ai RPG scenarios, kept as templates for a one-click
character wizard on a v2 of the `/rpg` lander.

| file | character | chat slug |
|---|---|---|
| `valdoria.json` | The world of Valdoria. 2.5 [ RPG ] | `the-world-of-valdoria-t7uPuVcteh` |
| `gravity.json` | Gravity [V2] | `gravity-oPYdC32EdC` |

Both are point-in-time snapshots — the version tags in the names (`2.5`, `[V2]`) suggest their
authors are still iterating, so re-pull before treating either as current:

```bash
node extract-character.js <chat-slug> > build.json
```

Needs no credentials. `privateDetails` comes back `null` on every character sampled, which may be
genuine or may be withheld from the client.
