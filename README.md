### 🍭 Multiuser MIDI Fluid 🍭 

- Based on [@PavelDoGreat](https://github.com/PavelDoGreat)'s fantastic  ([WebGL fluid simulator](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)) 
- I hacked in a [SignalR](https://github.com/SignalR/SignalR) based websocket bus, broadcasting all the "splats" and config changes via an [ASP.NET Core](https://github.com/dotnet/aspnetcore) backend, effectively making it multi-user.
- I removed the HTML config panel, and replaced it with [WebMIDI](https://www.w3.org/TR/webmidi/), mapping some of my `Traktor S3 MK3` MIDI knobs/sliders to _pressure/vorticity_ etc.


- Live version is at https://fluid.helaaspindakaas.xyz/ 
- A transparent background version can be used with OBS at https://fluid.helaaspindakaas.xyz/?transparent 

![Demo](demo/demo.gif)

- All the credit to [@PavelDoGreat](https://github.com/PavelDoGreat)
- [How to put Traktor S2 MK3 in MIDI mode](https://support.native-instruments.com/hc/en-us/articles/360006377918-How-to-Switch-Your-TRAKTOR-KONTROL-S2-MK3-to-MIDI-Mode), requires firmware update
