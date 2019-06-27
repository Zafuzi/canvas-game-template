// Copyright 2011 Sleepless Software Inc.  All Rights Reserved

function millis() { return new Date().getTime(); }
function pint(n) { var i = parseInt(n); return i ? i : 0; }
function ass(b, s) { if(b) alert(new Error(s || "Assertion failed").stack); }
function elem(id) { return document.getElementById(id); }

HTMLElement.prototype.html = function(h) {
	var oh = this.innerHTML;
	if(h !== undefined)
		this.innerHTML = h;
	return oh;
}

HTMLElement.prototype.rcv = function(ev, func)
{
	if(this.addEventListener)
		this.addEventListener(ev, func, false); 	// normal
	else
	if(this.attachEvent)
		this.attachEvent("on"+ev, func);			// IE
	return this;
}

function dbg(s) { var e = elem("dbg") ; if(e) e.html((s+"<br>\n"+e.html()).substr(0, 1000)); }



var system = { "browser":"unknown", "platform":"unknown" }
var m = navigator.userAgent.match(/(Firefox|Explorer|Safari|Chrome)/);
if(m)
	system.browser = m[1];
var m = navigator.userAgent.match(/(Mac|iPhone|Windows)/);
if(m)
	system.platform = m[1];


var seq = 0;	// unique id counter
var squids = [];	// the list of squids actively being processed by the main loop
var dead = [];	// the squids to remove from squids[] after each loop
var tick = 0;		// frame counter
var delay = 1000;


var s_tick = 0
var s_start = millis()
var fps = 0
function computeFPS() {
	var t, e, tpt, m = millis()

	if((tick % (1000 / (delay ? delay : 100))) == 0)
	{
		t = tick - s_tick;	// number of ticks we managed
		e = m - s_start;	// # of real millis that have elapsed
		tpt = (t > 0) ? (e / t) : 0;
		fps = Math.floor((tpt > 0) ? (1000 / tpt) : 0);
		// reset
		s_tick = tick;
		s_start = m;
	}
}


function Squid()
{
	var self = this;

	self.goSteps = 0;
	self.goStepX = null;
	self.goStepY = null;
	self.brain = null;
	self.name = "squid #"+seq++;
	self.velx = 0;
	self.vely = 0;
	self.friction = 0;
	self.lifeSpan = 0;
	self.age = 0;
    self.node = null;
    self.x = 0;
    self.y = 0;
    self.width = 0;
    self.height = 0;
    self.doDraw = true;

	self.name = function(n) {
		if(n === undefined)
			return self.name;
		self.name = ""+n;
		return self;
    }

	self.src = function(src) {
        
		if(src === undefined)
			return self.src;
        self.image = new Image(16, 16);
        self.src = src;
        self.image.src = src;
		return self;
	}

    self.setWidth = (w) => {self.width = w; return self;}
    self.setHeight = (h) => {self.height = h; return self;}

	self.setX = function(x) { self.x = x; return self; }
	self.setY = function(y) { self.y = y; return self; }
	self.setZ = function(z) { self.z = z; return self; }
	self.setXY = function(x, y) { self.setX(x); self.setY(y); return self; }

	self.getXY = function() { return {"x":self.x, "y":self.y}; }

	self.goXY = function(x, y, steps) {
		steps = steps === undefined ? 0 : pint(steps);
		self.goSteps = steps;
		if(steps == 0)
			return self.setXY(x, y);
		self.destX = x;
		self.destY = y;
		self.goStepX = (x - self.getX()) / steps;
		self.goStepY = (y - self.getY()) / steps;
		return self;
	}

	self.setVelX = function(n) { self.velx = n; return self; }
	self.setVelY = function(n) { self.vely = n; return self; }
	self.setVelXY = function(x, y) { return self.setVelX(x).setVelY(y); }

	self.setFric = function(f) { self.friction = f; return self; }

	self.live = function() {
        squids.push(self);
        self.show();
		return self;
	}
	self.die = function() {
		dead.push(self);
		self.hide()
		return self;
	}
	self.dieAt = function(n) {
		self.lifeSpan = n;
		return self;
	}

	self.show = function() {
        self.do_draw = true;
		return self;
	}
	self.hide = function() {
        self.do_draw = false;
		return self;
    }
    
    self.draw = function() {
        ctx.drawImage(self.image, self.x, self.y, self.width, self.height);
    }


	self.tick = function(t) {
		// do linear speed motion toward destx,desty
		if(self.goSteps > 0) {
			self.goSteps--;
			if(self.goSteps == 0)
				self.setXY(self.destX, self.destY);		// arrived at destx,desty
			else
				self.setXY(self.getX() + self.goStepX, self.getY() + self.goStepY);
		}

		// move according to velx,vely
		if(self.velx || self.vely)
			self.setXY(self.x + self.velx, self.y + self.vely);

		// apply friction (if any) to velx,vely
		if(self.friction) {
			self.velx *= self.friction;
			self.vely *= self.friction;
		}


		if(self.brain) {
			self.brain(t);
		}


		self.age++;

		if(self.lifeSpan > 0) {
			self.lifeSpan--;
			if(self.lifeSpan == 0)
				self.die();
        }

        if(self.doDraw)
            self.draw();

		return self;
	}


	self.brain = function(f) {
		if(f === undefined)
			return self.brain;
		self.brain = f;
		return self;
	}


	self.rcv = function(etype) {
		var e = self.node;
		if(e) {
			e.squid = self;
			var f = function(_evt) {
				var sq = self.squid;
				if(sq) {
					if(sq[_evt.type] instanceof Function) {
						sq[_evt.type].call(sq, _evt);
					}
				}
			}
			e.rcv(etype, function(evt2) { f.call(e, evt2); } );
		}
		return self;
	}

}
Squid.prototype = { "toString":function(){return "[object Squid]"} }


function squid_loop(newDelay) {
	var i, l, sq, sqa, sqd, n;

	if(typeof newDelay == "number" && newDelay >= 0)
		delay = newDelay;
	
	computeFPS();

	// tick() each living squid
	l = squids.length;
	for(i = 0; i < l; i++) {
		sq = squids[i];
		if(sq) {
			sq.apos = i;
			sq.tick(tick);
		}
	}

	// prune away dead squids
	l = dead.length;
	for(i = 0; i < l; i++) {
		sqd = dead.pop();	
		sqa = squids.pop();
		if(sqd != sqa)
			squids[sqd.apos] = sqa;
	}

	tick++;

}


dbg("Squids - Version "+document.lastModified+" Copyright "+(new Date().getFullYear())+" Sleepless Software inc.  All Rights Reserved");
dbg("platform="+system.platform+" browser="+system.browser);
