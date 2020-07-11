# React Hex Flower Engine

![Weather Generation Hex Flower Engine](./public/weather-flower-demo.png)

This is a simple application for managing a
[Hex Flower Engine](https://goblinshenchman.wordpress.com/2018/10/25/2d6-hex-power-flower/)
for any tabletop game in the browser.

It currently supports two engines:

- `Standard Hex Flower Engine`: basic hex flower engine with standard movement rules
  as described in the
  [article linked above](https://goblinshenchman.wordpress.com/2018/10/25/2d6-hex-power-flower/)
- `SKT Weather Engine`: modified hex flower engine built for a specific weather
  generator for a D&D campaign; rules are described
  [here](https://github.com/chrisman/skookums-and-dragons/wiki/House-rules#weather)

**Demo**: [https://dvdagames.github.io/react-hex-flower-engine/](https://dvdagames.github.io/react-hex-flower-engine/)

## How does it work?

The Hex Flower Engine's cells and travelling rules are described in a JavaScript
Object and the application leverages
[`@dvdagames/js-die-roller`](https://github.com/DVDAGames/js-die-roller) for
generating the next move.

It currenty allows you to roll `2d6` and move the appropriate direction on the
grid or roll `1d19` and move directly to the corresponding hex.

Each engine's current state is stored in `localStorage` so that users can come back
to the application and resume their engine where they left off and even swap engines
mid-session and not lose their current state.

## Resources

- https://goblinshenchman.wordpress.com/2018/10/25/2d6-hex-power-flower/
- https://goblinshenchman.wordpress.com/2018/10/25/2d6-hex-power-flower/
- https://goblinshenchman.files.wordpress.com/2019/04/ithots.png
