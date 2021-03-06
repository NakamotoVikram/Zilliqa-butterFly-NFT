var ContractAddress;
var ContractObject;
var ContractState;
var color = ["aqua","coral","fuchsia","gold","gray","lime","indigo","navy","OrangeRed","olive","SeaGreen","SkyBlue","crimson","teal","wheat","HotPink"];

function checkWallet(){
	if(window.zilPay){
		return true;
	}else{
		return false;
	}
}

async function connectWallet(){
	return (await window.zilPay.wallet.connect());
}

function loadContract(contractAddr){
	try{
		return window.zilPay.contracts.at(contractAddr);
	}catch(err){
		console.log(err.message);
		return false;
	}
}

function onloadInit(){
	connectAppToWallet();
	observer();
	console.clear();
	loadNFTContract();
}

function loadGallery(flag){
	if(!ContractObject){
		alert("Contract not loaded, please wait");
		loadNFTContract();
		return;
	}

	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "";

	tokenOwners = ContractState.token_owners;
	tokenMds = ContractState.token_mds;

	galleryCode = "<h2 style='width:100%' class='HVCenter'>" + ContractObject.init[1].value + "</h2>";

	var currentAccountAddress = window.zilPay.wallet.defaultAccount.base16;

	for(i in tokenOwners){

		if(flag){
			if(tokenOwners[i].toUpperCase() !== currentAccountAddress.toUpperCase()){			
				continue;
			}
		}

		var transferBtn = "";
		if(tokenOwners[i].toUpperCase() == currentAccountAddress.toUpperCase()){			
			transferBtn = "<button onclick='transferNFT(" + i + ")'>Transfer</button>"
		}		

		md1 = parseInt("0x"+tokenMds[i][3]);
		md2 = parseInt("0x"+tokenMds[i][5]);
		md3 = parseInt("0x"+tokenMds[i][7]);
		galleryCode += `
		<div id="nft-${i}" class="nft-card">
			<div class="nft-card-id HVCenter">NFT ID: ${i}&nbsp;${transferBtn}</div>
			<div class="nft-card-img-holder HVCenter">
				${buildFly(md1,md2,md3,i)}
			</div>
			<div class="nft-card-owner">Owner:&nbsp;${tokenOwners[i]}</div>
		</div>
		`;
	}

	gallery.innerHTML = galleryCode;
}

function loadMarket(){

	if(!ContractObject){
		alert("Contract not loaded, please wait");
		loadNFTContract()
		return;
	}

	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "Please wait while market is loaded";

	mdToId = ContractState.metadata_to_id;
	
	galleryCode = "<h2 style='width:100%' class='HVCenter'>butterFly Market</h2>";

	for (i = 0;i<=0xf; i++) {
		for (j = 0;j<=0xf; j++) {
			if(i == j) continue;
			for (k = 0;k<=0xf; k++) {
				if(k == j || i==k) continue;
					
					x=i.toString(16);
					y=j.toString(16);
					z=k.toString(16);

					var dna = `0x0${z}0${y}0${x}`;

					if(!mdToId[dna]){
						galleryCode += `
						<div class="nft-card">
							<div class="nft-card-id HVCenter">NFT DNA:&nbsp;${dna}</div>
							<div class="nft-card-img-holder HVCenter">
								${buildFly(k,j,i,dna)}
							</div>
							<div class="nft-card-owner"><button onclick="buyNFT('${z}','${y}','${x}')"">Buy</button></div>
						</div>
						`;
					}
			}			
		}		
	}

	gallery.innerHTML = galleryCode;
}


async function connectAppToWallet(){
	check1 = checkWallet();
	check2 = await connectWallet();
	if(check1 && check2){
		//if successful hide button and show net and address
		document.querySelector("#wallet-address-container").style.display = "inline-block";
		document.querySelector("#connect-button-container").style.display = "none";

		//get and set network and address
		let networkName = window.zilPay.wallet.net;
		let currentAddress = window.zilPay.wallet.defaultAccount.bech32;
		document.querySelector("#wallet-network-span").innerHTML = networkName;
		document.querySelector("#wallet-address-span").innerHTML = currentAddress;
	}else{
		//if connection failed 
		alert("Something went wrong connecting wallet, try again later.");
	}
}

function observer(){
	window.zilPay.wallet.observableAccount().subscribe(function (acc){
		if(acc) connectAppToWallet();
	});

	window.zilPay.wallet.observableNetwork().subscribe(function (net){
		if(net) connectAppToWallet();
	});
}


function loadNFTContract(){
	var contractAddress = "zil1h9wjm7rjqvsnkk5x7p7k37t555x36hpj7jmsgc";
	
	ContractObject = loadContract(contractAddress);
	if(ContractObject){
		ContractObject.getState().then(function(stateData){
			ContractState = stateData;
			ContractAddress = contractAddress;
			// alert("Contract State Loaded Successfully!");
			document.querySelector("#gallery-container").innerHTML = "Building Gallery";
			ContractObject.getInit().then(function(x){
				loadGallery(false);
			});

		});
	}else{
		ContractObject = undefined;
	}
}

function buyNFT(x,y,z){

	if(!ContractObject){
		alert("Please load contract first");
		return;
	}

	md1 = `0x0${x}`;
	md2 = `0x0${y}`;
	md3 = `0x0${z}`;

	/* Code for transaction call */
	const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);

	var tx = ContractObject.call('Mint',[{
		vname: "md1",
		type: "ByStr1",
		value: md1
	},{
		vname: "md2",
		type: "ByStr1",
		value: md2
	},{
		vname: "md3",
		type: "ByStr1",
		value: md3
	}],
	{
		amount: 25000000000000,
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(10000)
	});
	/* Code for transaction call */

	//handle the promise accordingly
	tx.then(function(a){
		alert(`Transaction ID: ${a.ID}`);
	});
}


function transferNFT(nftid){

	var receiverAddress = prompt("Please enter the address you want to send NFT ID:" + nftid + " to");

	/* Code for transaction call */
	const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);

	var tx = ContractObject.call('Transfer',[{
		vname: "to",
		type: "ByStr20",
		value: receiverAddress+""
	},{
		vname: "token_id",
		type: "Uint32",
		value: nftid+""
	}],
	{
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(10000)
	});
	/* Code for transaction call */

	//handle the promise accordingly
	tx.then(function(a){
		console.log(a);
	});
}

function buildFly(md1,md2,md3,i){

	var fly = `
	<svg id="fly" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512.005 512.005" style="enable-background: new 0 0 512.005 512.005;" xml:space="preserve">
		<defs>
		<linearGradient id="grad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
		  <stop offset="0%" style="stop-color:${color[md1]};stop-opacity:1"/>
		  <stop offset="100%" style="stop-color:${color[md2]};stop-opacity:1"/>
		</linearGradient>
		</defs>
		<g transform="translate(1 1)">
			<g>
				<path style="fill:${color[md1]};" d="M212.336,250.778c0-52.907,11.093-98.987,26.453-117.76c-37.547-34.133-128-112.64-180.053-112.64    H41.669c0,0-34.133,0-34.133,25.6c0,0-2.56,28.16,25.6,42.667l0,0c19.627,16.213,23.04,44.373,8.533,65.707    c-11.947,17.067-25.6,23.893-25.6,53.76c0,0-1.707,40.96,34.133,76.8c0,0,21.333,17.067,68.267,17.067h42.667    c0,0,28.16,1.707,53.76-5.12C213.189,282.352,212.336,266.992,212.336,250.778" id="uwl"/>
				<path style="fill:${color[md2]};" d="M214.896,296.858c-25.6,6.827-53.76,5.12-53.76,5.12h-42.667    c-46.933,0-68.267-17.067-68.267-17.067s-34.133,20.48-34.133,85.333c0,0-2.56,42.667,34.133,42.667    c0,0,34.133-2.56,34.133,34.133c0,0,2.56,42.667,25.6,42.667c0,0,19.627,2.56,24.747-22.187c2.56-12.8,8.533-24.747,16.213-35.84    c17.067-24.747,46.08-61.44,81.067-74.24C224.283,342.938,218.309,321.605,214.896,296.858" id="lwl"/>
			</g>
			<g>
				<path style="fill:url(#grad${i});" d="M297.669,250.778c0,70.827-18.773,128-42.667,128s-42.667-57.173-42.667-128s18.773-128,42.667-128    S297.669,179.952,297.669,250.778" id="body"/>
				<path style="fill:${color[md1]};" d="M468.336,154.352c-14.507-20.48-11.093-49.493,8.533-65.707l0,0    c28.16-15.36,25.6-42.667,25.6-42.667c0-25.6-34.133-25.6-34.133-25.6h-17.067c-52.053,0-142.507,78.507-180.053,112.64    c15.36,18.773,26.453,64.853,26.453,117.76c0,16.213-0.853,31.573-2.56,46.08c25.6,6.827,53.76,5.12,53.76,5.12h42.667    c46.933,0,68.267-17.067,68.267-17.067c35.84-35.84,34.133-76.8,34.133-76.8C493.936,178.245,480.283,171.418,468.336,154.352" id="uwr"/>
			</g>
			
			<path style="fill:${color[md2]};" d="M493.936,370.245c0-64.853-34.133-85.333-34.133-85.333s-21.333,17.067-68.267,17.067h-42.667   c0,0-28.16,1.707-53.76-5.12c-3.413,24.747-8.533,46.08-16.213,60.587c34.987,12.8,64,49.493,81.067,74.24   c7.68,11.093,12.8,23.04,16.213,35.84c4.267,24.747,23.893,22.187,23.893,22.187c23.04,0,25.6-42.667,25.6-42.667   c0-36.693,34.133-34.133,34.133-34.133C496.496,412.912,493.936,370.245,493.936,370.245" id="lwr"/>
			
			<g>
				<path style="fill:${color[md3]};" d="M127.003,361.712c0,9.387-7.68,17.067-17.067,17.067s-17.067-7.68-17.067-17.067    s7.68-17.067,17.067-17.067S127.003,352.325,127.003,361.712" id="lwcl"/>
				<path style="fill:${color[md3]};" d="M417.136,361.712c0,9.387-7.68,17.067-17.067,17.067s-17.067-7.68-17.067-17.067    s7.68-17.067,17.067-17.067S417.136,352.325,417.136,361.712" id="lwcr"/>
				<path style="fill:${color[md3]}" d="M144.069,216.645c0,18.773-15.36,34.133-34.133,34.133s-34.133-15.36-34.133-34.133    s15.36-34.133,34.133-34.133S144.069,197.872,144.069,216.645" id="uwcl"/>
			</g>
			
			<path style="fill:${color[md3]};" d="M434.203,216.645c0,18.773-15.36,34.133-34.133,34.133s-34.133-15.36-34.133-34.133   s15.36-34.133,34.133-34.133S434.203,197.872,434.203,216.645" id="uwcr"/>
			
			<path d="M255.003,387.312c-33.28,0-51.2-68.267-51.2-136.533s17.92-136.533,51.2-136.533s51.2,68.267,51.2,136.533   C306.203,318.192,288.283,387.312,255.003,387.312z M255.003,131.312c-13.653,0-34.133,46.933-34.133,119.467   s20.48,119.467,34.133,119.467c13.653,0,34.133-46.933,34.133-119.467C289.136,177.392,268.656,131.312,255.003,131.312z"/>
			<path d="M338.629,310.512c-11.947,0-29.867-0.853-46.08-5.12l-6.827-1.707l0.853-7.68c1.707-14.507,2.56-29.867,2.56-45.227   c0-49.493-9.387-94.72-24.747-112.64l-5.12-5.973l5.973-5.12c46.933-43.52,132.267-115.2,186.027-115.2h17.067   c14.507,0,42.667,7.68,42.667,34.133c0,4.267,0.853,33.28-29.013,50.347c-15.36,13.653-17.92,36.693-6.827,53.76   c2.56,4.267,5.973,7.68,8.533,11.093c9.387,10.24,18.773,21.333,18.773,46.933c0,1.707,1.707,45.227-36.693,82.773l-0.853,0.853   c-0.853,0.853-23.893,18.773-73.387,18.773h-42.667C348.869,310.512,344.603,310.512,338.629,310.512z M304.496,290.032   c12.8,2.56,25.6,3.413,34.987,3.413c5.973,0,9.387,0,9.387,0h43.52c40.107,0,59.733-12.8,62.293-15.36   c32.427-32.427,31.573-69.973,31.573-69.973c0-19.627-5.973-27.307-14.507-36.693c-3.413-3.413-5.973-7.68-9.387-11.947   c-17.067-24.747-12.8-58.027,10.24-76.8l1.707-0.853c23.04-11.947,21.333-33.28,21.333-34.133   c-1.707-18.773-27.307-18.773-27.307-18.773h-17.067c-33.28,0-96.427,39.253-168.107,104.96   c14.507,23.893,23.893,68.267,23.893,116.907C306.203,264.432,305.349,277.232,304.496,290.032z"/>
			<path d="M398.363,498.245c-12.8,0-27.307-7.68-31.573-29.013c-2.56-11.093-6.827-22.187-14.507-33.28   c-14.507-21.333-43.52-58.88-76.8-70.827l-9.387-3.413l4.267-8.533c6.827-13.653,11.947-34.133,15.36-58.027l0.853-9.387   l9.387,2.56c16.213,4.267,33.28,5.12,41.813,5.12c5.12,0,8.533,0,9.387,0h43.52c42.667,0,63.147-15.36,63.147-15.36l4.267-3.413   l5.12,2.56c2.56,0.853,39.253,23.893,39.253,93.013c0,0,1.707,23.893-12.8,39.253c-7.68,7.68-17.067,11.947-29.867,11.947h-0.853   c-9.387,0-24.747,3.413-24.747,25.6c0,5.973-4.267,51.2-34.133,51.2C400.069,498.245,399.216,498.245,398.363,498.245z    M289.989,353.178c32.427,15.36,59.733,47.787,76.8,74.24c8.533,12.8,14.507,25.6,17.067,39.253s10.24,15.36,14.507,15.36h0.853   c11.947,0,17.067-23.893,17.92-34.987c0-30.72,22.187-41.813,41.813-41.813c0.853,0,1.707,0,1.707,0   c6.827,0,12.8-2.56,17.067-6.827c8.533-9.387,7.68-26.453,7.68-27.307c0-46.933-17.92-68.267-26.453-75.093   c-9.387,5.12-31.573,14.507-67.413,14.507h-42.667c0,0-3.413,0-9.387,0c-9.387,0-23.04-0.853-37.547-3.413   C299.376,325.018,295.109,340.378,289.989,353.178z"/>
			<path d="M171.376,310.512c-6.827,0-10.24,0-10.24,0h-42.667c-49.493,0-72.533-17.92-73.387-18.773l-0.853-0.853   C6.682,253.338,7.536,209.818,7.536,208.112c0-25.6,9.387-36.693,18.773-47.787c2.56-3.413,5.973-6.827,8.533-11.093   c11.947-17.067,8.533-40.107-6.827-53.76C-1.851,79.258-0.998,50.245-0.998,45.978c0-26.453,28.16-34.133,42.667-34.133h17.067   c53.76,0,139.093,71.68,185.173,114.347l5.973,5.12l-5.12,5.973c-11.947,16.213-23.893,56.32-23.893,113.493   c0,15.36,0.853,30.72,2.56,45.227l0.853,7.68l-6.827,1.707C200.389,309.658,183.323,310.512,171.376,310.512z M56.176,278.085   c2.56,1.707,22.187,15.36,62.293,15.36h42.667c0.853,0,4.267,0,10.24,0c9.387,0,22.187-0.853,34.987-3.413   c-1.707-12.8-2.56-25.6-2.56-39.253c0-48.64,9.387-93.013,23.893-116.907c-72.533-65.707-135.68-104.96-168.96-104.96H41.669   c-0.853,0-25.6,0.853-25.6,17.067v0.853c0,0.853-1.707,22.187,21.333,34.133l1.707,0.853c23.04,19.627,27.307,52.053,10.24,76.8   c-3.413,5.12-6.827,8.533-9.387,11.947c-8.533,10.24-14.507,17.067-14.507,36.693C24.602,208.965,23.749,245.658,56.176,278.085z"/>
			<path d="M111.642,498.245L111.642,498.245c-0.853,0-1.707,0-1.707,0c-29.013,0-33.28-45.227-33.28-50.347   c-0.853-23.04-16.213-26.453-25.6-26.453h-0.853c-12.8,0-22.187-4.267-29.867-11.947c-14.507-15.36-12.8-39.253-12.8-40.107   c0-68.267,36.693-91.307,38.4-92.16l5.12-3.413l4.267,3.413c0,0,20.48,15.36,63.147,15.36h42.667c0.853,0,4.267,0,9.387,0   c8.533,0,26.453-0.853,42.667-5.12l9.387-2.56l0.853,9.387c3.413,23.893,8.533,44.373,15.36,58.027l4.267,8.533l-9.387,3.413   c-33.28,11.947-62.293,49.493-76.8,70.827c-7.68,11.093-11.947,22.187-14.507,33.28   C138.949,490.565,123.589,498.245,111.642,498.245z M51.056,404.378c18.773,0,41.813,11.093,41.813,42.667   c0.853,11.093,5.973,34.133,17.067,34.133h1.707c4.267,0,11.947-1.707,14.507-15.36c2.56-12.8,8.533-26.453,17.067-39.253   c17.92-25.6,44.373-58.88,76.8-74.24c-5.12-12.8-9.387-28.16-11.947-45.227c-13.653,2.56-27.307,3.413-37.547,3.413   c-5.973,0-10.24,0-10.24,0l-41.813,0c-35.84,0-58.027-9.387-67.413-15.36c-8.533,7.68-26.453,29.013-26.453,75.093   c0,0.853-0.853,17.92,7.68,27.307c4.267,4.267,10.24,6.827,17.92,6.827H51.056z"/>
			<path d="M246.469,131.312c-4.267,0-7.68-2.56-8.533-6.827c-6.827-37.547-25.6-97.28-51.2-95.573c-4.267,0-8.533-3.413-9.387-7.68   c0-5.12,3.413-8.533,7.68-9.387c47.787-3.413,66.56,98.133,68.267,109.227C254.149,125.338,250.736,130.458,246.469,131.312   C247.323,131.312,247.323,131.312,246.469,131.312z"/>
			<path d="M263.536,131.312c-0.853,0-0.853,0-1.707,0c-4.267-0.853-7.68-5.12-6.827-10.24c1.707-11.947,20.48-112.64,68.267-109.227   c5.12,0,8.533,4.267,7.68,9.387c0,5.12-4.267,8.533-9.387,7.68c-24.747-1.707-44.373,58.027-51.2,95.573   C271.216,128.752,267.803,131.312,263.536,131.312z"/>
			<path d="M109.936,259.312c-23.893,0-42.667-18.773-42.667-42.667s18.773-42.667,42.667-42.667s42.667,18.773,42.667,42.667   S133.829,259.312,109.936,259.312z M109.936,191.045c-14.507,0-25.6,11.093-25.6,25.6c0,14.507,11.093,25.6,25.6,25.6   s25.6-11.093,25.6-25.6C135.536,202.138,124.442,191.045,109.936,191.045z"/>
			<path d="M400.069,259.312c-23.893,0-42.667-18.773-42.667-42.667s18.773-42.667,42.667-42.667   c23.893,0,42.667,18.773,42.667,42.667S423.962,259.312,400.069,259.312z M400.069,191.045c-14.507,0-25.6,11.093-25.6,25.6   c0,14.507,11.093,25.6,25.6,25.6s25.6-11.093,25.6-25.6C425.669,202.138,414.576,191.045,400.069,191.045z"/>
			<path d="M127.003,148.378c-5.12,0-8.533-3.413-8.533-8.533c0-14.507-11.093-25.6-25.6-25.6c-5.12,0-8.533-3.413-8.533-8.533   c0-5.12,3.413-8.533,8.533-8.533c23.893,0,42.667,18.773,42.667,42.667C135.536,144.965,132.122,148.378,127.003,148.378z"/>
			<path d="M383.003,148.378c-5.12,0-8.533-3.413-8.533-8.533c0-23.893,18.773-42.667,42.667-42.667c5.12,0,8.533,3.413,8.533,8.533   c0,5.12-3.413,8.533-8.533,8.533c-14.507,0-25.6,11.093-25.6,25.6C391.536,144.965,388.122,148.378,383.003,148.378z"/>
			<path d="M109.936,387.312c-14.507,0-25.6-11.093-25.6-25.6s11.093-25.6,25.6-25.6s25.6,11.093,25.6,25.6   S124.442,387.312,109.936,387.312z M109.936,353.178c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533   c5.12,0,8.533-3.413,8.533-8.533S115.056,353.178,109.936,353.178z"/>
			<path d="M400.069,387.312c-14.507,0-25.6-11.093-25.6-25.6s11.093-25.6,25.6-25.6s25.6,11.093,25.6,25.6   S414.576,387.312,400.069,387.312z M400.069,353.178c-5.12,0-8.533,3.413-8.533,8.533s3.413,8.533,8.533,8.533   s8.533-3.413,8.533-8.533S405.189,353.178,400.069,353.178z"/>
		</g>
	</svg>
	`;
	return fly;
}

