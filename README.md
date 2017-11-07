# The Elite: Dangerous Immersion Toolkit

The The Elite: Dangerous Immersion Toolkit (EDIT) is an application that integrates with the Elite: Dangerous commander log and provides a way to have external actions trigger on events from the log.

Once started it looks for the current game log, a list of event methods are provided that do actions based on the events from the log. For example if we get the `HeatWarning` event we trigger our environmental
effects set for it.

```json
{ "timestamp":"2017-11-05T21:13:28Z", "event":"HeatWarning" }
```

It also provides a way to create environmental schemes for ambient light.  Currently the app only ships with star colours, but could be extended to include things like star system economy types.

Currently the only implemented plugin is the Philips Hue light control.  Features to be added:

- [ ] Play sounds
- [ ] Trigger Webhooks
- [ ] Create streaming endpoints
- [ ] Write to another file
- [ ] Better API Endpoint and behind token based authentication
- [ ] Better Docs!

## Why create this tool

It started as an experiment with the Philips Hue API and integrating it into the game events.  I started with [an experiment using the light](https://www.youtube.com/watch?v=Kka75Iqs-tE) and triggering on certain events. Once I got this
working I realised I could add other outputs from the app such as playing an additional sound, or triggering a webhook to a peripheral or network service.

This app is built on nodejs 8 and uses `async/await` through the code to achive a well structured layout in writing light recipies.

## Installing

Currently the application is alpha software and not yet available via npm, or as a binary.  You can however clone the repository:

```bash
> git clone https://github.com/ed-it/toolkit.git ed-it
> cd ed-it
> npm install
> npm start
```

Once up and running you can go to [http://localhost:12342/hubs](http://localhost:12342/hubs) and click "Manage Hubs".  It will find all available hubs in the network.  Select the one you want to use for the client.
Next go to [http://localhost:12342/settings](http://localhost:12342/settings) and enter the username associated with your hub (docs on this soon!).

> *You should set this up before you start the game*

You also need to enter the location of you Elite: Dangerous logs.  On Windows this is usually `C:\Users\[username]\Documents\Save Games\Frontier Developments\Elite Dangerous`.
