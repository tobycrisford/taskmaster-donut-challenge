# Taskmaster Doughnut Challenge

This repo is based on the final task of Taskmaster Series 3 Episode 5.

Each player has a stick, and some doughnuts (one doughnut for every player in the game). Each player secretly decides how many doughnuts to place on their stick. Once everyone has decided, the choices are revealed, and the winner is the player who has selected the
smallest *unique* number of doughnuts to place on their stick. If no one's selection is unique,
then there is no winner, and we repeat until a winner is found.

This repo contains an interactive game following the above rules, written in javascript, where you can play against several AI players, each following different strategies.

The most interesting strategy is the Nash equilibrium strategy, calculated numerically for different numbers of players in the donut_challenge.py python script. The rest of this readme explains how the Nash equilibrium strategy works, how it is calculated, and what the Nash equilibrium strategy is for the doughnut challenge with different numbers of players.

## What is Nash equilibrium?

In this challenge, we are playing a game where our best move depends on what the other players do, and they make their decision in secret. In games like this, you can't find the optimum strategy with maths alone. That's because the optimum strategy is to accurately predict what the other players are going to do, and respond accordingly, and that is a problem in psychology, not mathematics.

However, using Game Theory, you *can* calculate something called the Nash equilibrium strategy. This is a strategy with the following property:

*If all players are following the Nash equilibrium strategy, then no individual player can benefit by deviating from the Nash equilibrium strategy.*

In this sense, the Nash equilibrium strategy represents a kind of stable situation. In an interesting game, the Nash equilibrium strategy will involve selecting from a few options at random, according to particular probabilities. For example, in Rock/Paper/Scissors, the Nash equilibrium strategy is to select between Rock, Paper, or Scissors, with 1/3 probability each. This isn't so interesting, because all moves are equally good. But in more complicated games, like the Taskmaster doughnut challenge, the Nash strategy will have you selecting between the different moves with different probabilities. In the doughnut challenge, we will typically be assigning higher probabilities to the smaller numbers.

If you had a perfectly rational self-interested player, who knew for certain that all the other players were *also* perfectly rational and self-interested, then you might expect this player to adopt the Nash equilibrium strategy when playing the game. Why is this? Well no other strategy would make sense for them. If you were to propose that a rational self-interested player should instead pursue strategy X, then they should expect that all the *other* players will play X as well, since we are assuming they are all reasoning similarly. But if all the other players are playing X, and X is not a Nash equilibrium strategy, then X is not the best strategy to pick in response, and we have a contradiction.

But it is important to stress that this does not mean a player following the Nash equilibrium strategy will always come out on top against players who are following a different strategy. For example, in Rock/Paper/Scissors, if a player follows the Nash equilibrium strategy of randomly picking between the moves with 1/3 probability each, then their chance of eventual victory (and their opponent's) will always be 50/50. This is true whatever their opponent is doing. They have no advantage over *any* possible opponent.

## Calculating the Nash Equilibrium for the Doughnut Challenge

## Results

