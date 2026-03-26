# Tuner - Brain Dump

A simple, multipurpose web-based musical tuner using the mic. Free of ads and distraction. Offers all possible tuning configurations. Mostly for personal use. Will live at tuner.obfusco.us.

# Wednesday March 25
[x] run the claude md and build and run this app
[x] keep the pitch up on the screen longer (it goes away so fast hard to see what key we're in)
[x] add spectragraphic colors to help the user hone in on the right key
[x] remove "listening..." and always keep sharp/flat meter up to reduce jiggle
[x] spacebar should stop it
[x] add chord identification mode
[x] add some background visualizer like this: https://brad-carter.medium.com/see-the-sound-the-code-behind-music-visualizers-b8d0099f1302
[x] the visualizer should stretch 100% width and be centered vertically, so it dances behind the key
[x] here's that reference again: ![alt text](.screenshots/image.png)
[x] let's get this up on a server at tuner.obfusco.us
[x] the visualizer is covering up the key zone in the middle too much, make sure it's behind the info and make it more transparent in the center so the center (key zone) is legible
[x] let's have main branch autodeploy to tuner.obfusco.us
[x] let's create an active dev branch called nmj/w1 and have this autodeploying to tuner-dev.obfusco.us
[x] at the beginning of each week (this is week 1) create a new branch of the form nmj/wX where X is the number of the week.  at the same time switch the branch actively deploying to the dev url (tuner-dev.obfusco.us) to this newly created branch
[x] yes, save this pattern for global use as well with all my projects
[x] let's add a visualization for the key/sharp/flat acts like a sphere with the keys listed around it in a circle that animates between keys by spinning and giving a nice indication of being sharp/flat or in tune with helpful colors
[x] let's try giving that sphere some skin and opacity
[x] let's try a similar style for another sphere that glides between flat and sharp
[x] key area should be more readable. dim the waveform a bit more there and ensure all that text is readable and in front of the waveform.  this is especially important on mobile. let's actually try making the waveform arch over and under the key area
[x] add a button to turn off and on the waveform visual easily
[x] make the spheres more 3d
[x] make the visualization arches not touch the key area at all (just encircle it)
[x] stylize the start tuning button like a gently bobbing/floating and slowly rotating sphere created
[x] still want to see more opacity on those spheres
[x] the visualization still kinda covers some of the spheres. it should either shrink to fit or simply go offscreen![](<.screenshots/Screenshot 2026-03-25 at 16.03.04.png>)
[x] note that the visualization doesn't necesarily help the user tune.  it's simply for fun, so it should be treated accordingly
[x] let's give the visualizer a bit more love.  let's try to encircle the key area with it so it's one endless ribbon (with one long subtle 180 twist in it)
[x] stylize the stop button like the start button using somewhat randomly generated versions of those spheres in image-1.png
[x] restylize the start sphere using those images as reference too.  they should auto generate unique versions each session
[x] make those sphere buttons a bit more gridlike and more transparent
[x] let's keep working on the visualization ribbon.  it should vibrate to expand the space available without infringing on the key area
[x] change the favicon to better match the concept of those spheres
[x] something is not right with the last ribbon adjustment though.  it's smaller now and i actually wanted it bigger and more responsive to the audio, still without infringing on the center
[x] those sphere buttons are too regular and symmetrical now.  they should be more chaotic
[x] let's try slowing down the rotation of the key sphere so it doesn't jump around so much and seems like a smoother experience
[x] move the stop button sphere up a bit so it's not interfering with the visualizer ribbon
[x] commit changes and then switch back to dev branch for more work
[x] update the project readme with all these updates and also update all the mds
[x] on my mobile the bottom of the ribbon is going off the bottom when it shouldn't be ![alt text](.screenshots/signal-2026-03-25-172650.png)
[x] the bottom looks good now, but the top looked better before.  now the top is impinging upon the key section
[x] now the bottom is getting cutoff again on my pixel 7
[x] it looks good on desktop
[x] looks like the top is still bad on the same device![alt text](.screenshots/signal-2026-03-25-174052.png)
[x] that last procedure pushed the top of the ribbon down even farther when it should have been up
[x] make the tuner logo lowercase and multicolored in roboto mono
[x] ok, now desktop ribbon placement isn't right.  it's going through the stop button![alt text](<.screenshots/Screenshot 2026-03-25 at 17.47.07.png>)
[x] mobile is still not quite right either.  the key area is being run through![alt text](.screenshots/signal-2026-03-25-174807.png)
[x] wow, no, make desktop ribbon look like it did when i said "desktop looks good though"
[x] and mobile was better before too.  now it's just a weird oval
[x] desktop ribbon should not go through the stop button like this ![alt text](<.screenshots/Screenshot 2026-03-25 at 17.53.35.png>)
[x] roll the mobile back version a couple cuz it's still a weird oval
[x] desktop is looking good
[x] mobile is still not good at all, literally need to make it look like any of those earlier screenshots and it would be fine.  it's garbage now.
[x] mobile is still garbage.  it needs to be a colorful ribbon again, not this: ![alt text](.screenshots/signal-2026-03-25-175916.png)
[x] let's save this state because it's looking good on desktop and goodish on mobile, but the bottom is going off the screen again while it still has like 70px to play with there ![alt text](.screenshots/signal-2026-03-25-180522.png)
[x] make the start button also trigger a fullscreen
[x] that should only be for mobile
[x] ok get these changes onto main

# Thursday March 26

[x] try jumbling the letters of the logo a bit so they seem more fun/playful
[x] let's work on improving the accuracy and ease of reading as the user tunes
[x] reduce the jumping around that seems to happen when tuning
[x] make the key spheres light up specially when honing in closer to being perfectly in pitch
[x] the notches on the sharp/flat ring should be more pronounced
[x] it's still a little bit jumpy but much better.  is there anything more that can improve performance and use?
[x] let's increase those ticks a little more, too
[x] make centsphere also light up when in pitch
[x] let's try to subtly change the colors of the spheres from green to a mild shade of whatever the key color is registering.  make sure to create appropriate contrast for best visibility
[x] make the spheres look 3d still, but remove the glow from them because it affects the visibility of the key/cents.
[x] i want the appearance of the spheres to be that they themselves are actually spinning.  can we try to actually rotate the key letters to reflect being turned backwards?
[x] i want the glow back.  it's the reflection that i have trouble with.  this part![alt text](<.screenshots/Screenshot 2026-03-26 at 13.05.57.png>)
[x] ok commit these changes and merge into main branch
[x] pressing stop on mobile should exit fullscreen mode as well