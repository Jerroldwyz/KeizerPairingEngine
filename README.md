# KeizerPairingEngine
Student internship project with Swinburne University. Front end pairing engine and framework in TypeScript
December 15, 2022 - February 24, 2023

Front end pairing engine and framework in TypeScript.  

## Communication
1) Zoom Chat (Tornelo Pairing Project group chat) 
2) Email <br />
    a) Rafi Memon  memonrafiullah76@gmail.com <br />
    b) Jerrold Wong  jerroldwongyz@gmail.com <br />
    c) David Cordover  david@tornelo.com <br />
    d) Simon Dale scd@thecrag.com	 <br />
3) Phone <br />
    a) Rafi  0451 401 202 <br />
    b) Jerrold  0493 412 429 <br />
    c) David  0411 877 833 <br />
    d) Simon  0407 834 027 <br />
  
## Background
**Staging Environment for testing Tornelo:** <br />
https://staging.tornelo.com/chess <br />
Create an account, run an event, explore and play.

**Pairing rules:** <br />
https://jbfsoftware.com//sevilla-keizer/ 

**JaVaFo implementation guide:** <br />
http://www.rrweb.org/javafo/aum/JaVaFo2_AUM.htm

The input and output formats will be the same for the Front-End engine as are described in the JaVaFo implementation. 

Input in the format of TRFx and output is a list of pairs.

**Description of TRFx file format:** <br />
https://home.tornelo.com/knowledge-base/trfx-file-format/

## Project summary

Text input in TRFx file format
Text output in List of Pairs 

List of pairs output to be according to the rules of the Keizer pairing rules.

Will be run in the browser <br />
    a) Algorithm must work in a performant way for pairings of 1500 players <br />
        1) Must return a pairing in under 30 seconds with the maximum players and complexity <br />
        2) Should be able to run on browser on a low-spec machine (eg. tablet in Africa) <br />
    b) Automated test suite <br />
