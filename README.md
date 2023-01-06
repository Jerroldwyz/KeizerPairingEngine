# KeizerPairingEngine
Student internship project with Swinburne University. Front end pairing engine and framework in TypeScript
December 15, 2022 - February 24, 2023

Front end pairing engine and framework in TypeScript.  

## Communication
1) Zoom Chat (Tornelo Pairing Project group chat) 
2) Email 
	a) Rafi Memon  memonrafiullah76@gmail.com 
    b) Jerrold Wong  jerroldwongyz@gmail.com 
    c) David Cordover  david@tornelo.com
    d) Simon Dale scd@thecrag.com	 
3) Phone
    a) Rafi  0451 401 202
    b) Jerrold  0493 412 429
    c) David  0411 877 833
    d) Simon  0407 834 027
  
## Background
**Staging Environment for testing Tornelo:**
https://staging.tornelo.com/chess 
Create an account, run an event, explore and play.

**Pairing rules:**
https://jbfsoftware.com//sevilla-keizer/ 

**JaVaFo implementation guide:**
http://www.rrweb.org/javafo/aum/JaVaFo2_AUM.htm

The input and output formats will be the same for the Front-End engine as are described in the JaVaFo implementation. 

Input in the format of TRFx and output is a list of pairs.

**Description of TRFx file format:**
https://home.tornelo.com/knowledge-base/trfx-file-format/

## Project summary

Text input in TRFx file format
Text output in List of Pairs 

List of pairs output to be according to the rules of the Keizer pairing rules.

Will be run in the browser
    a) Algorithm must work in a performant way for pairings of 1500 players
        i) Must return a pairing in under 30 seconds with the maximum players and complexity
        ii) Should be able to run on browser on a low-spec machine (eg. tablet in Africa)
    b) Automated test suite
