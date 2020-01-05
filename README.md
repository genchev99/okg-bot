# okg-bot
Automatically completes the christmas tasks for OKG 

### Requirements

- Node.js
- npm


### Set up

- Clone the repo [git clone https://github.com/genchev99/okg-bot && cd okg-bot]
- In the roo folder create a `.env` file [touch .env]
- Make sure the `.env` file contains USERNAME && PASSWORD like so
        USERNAME=<your moodle username> [required]
		PASSWORD=<your moodle password> [required]
		CONCURRENCY=<number> [not required]
		HEADLESS=<0/1> [not required]
- Example
        USERNAME=imefamilkov
		PASSWORD=silnaparola12
		CONCURRENCY=1 # how many pages to run in parallel 
		HEADLESS=0 # 1 to make the browser visible {doesnt work very well with higher concurrecy}
- To start the script simply use `node index.js`
