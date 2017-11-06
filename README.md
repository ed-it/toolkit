# Elite Dangerous Hue Scripter

This app is built on nodejs and creates a process that watches for changes in the Elite Dangerous Commander log.  Based on those events it loads scripts that trigger single or multiple colour changes via a keyword.

For example an event might be:

```json
{ "timestamp":"2017-09-04T17:16:20Z", "event":"DockingGranted", "LandingPad":5, "StationName":"Cauchy Settlement" }
```

We might trigger a light event where we start flashing oue Hue devices.  If we have one colour device we can run through a red and green phase for 5 cycles.  If we have two devices we can use one to be red and one to be green, and alternate their pattern.

**please note the below code is subject to change**

Here is a current pattern:

```json
{ "timestamp":"2017-11-05T21:13:28Z", "event":"HeatWarning" }
```

Here is the event for it:

```js
const register = ({ edHub }) => ({
    event: 'HeatWarning',
    set: async event => {
    
        const lights = await edHub.client.lights.getAll();

        for (let i = 0; i < 5; i++) {
            lights.forEach(async light => {
                light.on = true;
                light.brightness = 254;
                light.xy = edHub.rgbToXy(254, 0, 0);
                light.saturation = 254;
                await edHub.client.lights.save(light).then(async() => await edHub.sleep(process.env.TEST_BLINK || 2000));
            });
            await edHub.sleep(process.env.TEST_BLINK || 2000);

            lights.forEach(async light => {
                light.on = false;
                await edHub.client.lights.save(light).then(async() => await edHub.sleep(process.env.TEST_BLINK || 2000));
            });
        }
    }
});

module.exports = register;
```

Using `async/await` we can then generate a scene we can send to the Hub lights using async code.
