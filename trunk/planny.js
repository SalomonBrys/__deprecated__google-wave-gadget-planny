
dojo.require("dojox.widget.Calendar");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");

var dayArrayMed = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
var dayArrayLong = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var monthArrayMed = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
var monthArrayLong = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

var planny = {};
var self = "";

function zeroFill2(n)
{
	if (n.toString().length >= 2)
		return n.toString();
	return '0' + n.toString();
}

AddDate = {
	cal: null,
	button: null,
	addButton: null,
	show : function()
	{
		dojo.byId('planny').className = "small";

		AddDate.button.domNode.style.display = "none";
		dojo.byId('addDate').style.display = "block";

		gadgets.window.adjustHeight();
	},
	removeTime : function(p)
	{
		dojo.byId('addDateDivText').removeChild(p);
	},
	timeClicked: function(hour)
	{
		dojo.byId('addDateDivText').innerHTML +=
				"<p onclick='AddDate.removeTime(this);'>"
			+			zeroFill2(AddDate.cal.value.getDate())
			+	"." +	zeroFill2(AddDate.cal.value.getMonth() + 1)
			+	"." +	AddDate.cal.value.getFullYear()
			+	" "	+	hour
			+	"</p>";

		AddDate.addButton.setDisabled(false);
		
		gadgets.window.adjustHeight();
	},
	hide : function()
	{
		dojo.byId('planny').className = "edit";

		AddDate.addButton.setDisabled(true);
		AddDate.button.domNode.style.display = "inline";
		dojo.byId('addDate').style.display = "none";
		dojo.byId('addDateDivText').innerHTML = "";

		gadgets.window.adjustHeight();
	},
	add : function()
	{
		var datetimes = new Array();
		var els = dojo.byId('addDateDivText').childNodes;
		for ( var i = 0; i < els.length; ++i)
			if (els[i].tagName == 'p' || els[i].tagName == 'P')
			{
				var dt = els[i].innerHTML.split(' ');
				date = dt[0].split('.');
				time = dt[1].split('h');
				datetimes.push(date[2] + date[1] + ' ' + date[0] + ' ' + time[0] + time[1]);
			}

		array = plannyToArray();
		for ( var i = 0; i < array.length; ++i)
			datetimes.push(array[i]);

		datetimes.sort();
		arrayToPlanny(datetimes);
		AddDate.hide();
		wave.getState().submitValue('planny', plannyToArray().join(','));
	}
};

function plannyToArray()
{
	var array = new Array();
	for ( var month in planny)
		for ( var day in planny[month])
			for ( var time in planny[month][day])
			{
				var txt = month + ' ' + day + ' ' + time
				if (planny[month][day][time].length != 0)
					txt += ' ' + planny[month][day][time].join(':');
				array.push(txt);
			}
	return array;
}

function arrayToPlanny(array)
{
	planny = {};
	for ( var i = 0; i < array.length; ++i)
	{
		var dt = array[i].split(' ');
		var month = dt[0];
		var day = dt[1];
		var time = dt[2];
		if (!planny[month])
			planny[month] = {};
		if (!planny[month][day])
			planny[month][day] = {};
		if (!planny[month][day][time])
			planny[month][day][time] = new Array();

		if (dt[3])
			planny[month][day][time] = dt[3].split(':');
	}
}

function findInArray(array, value)
{
	for ( var i = 0; i < array.length; ++i)
		if (array[i] == value)
			return i;
	return -1;
}

function createPlannyTable()
{
	var table = dojo.byId('planny');
	table.innerHTML = "";
	
	function addUserInvisibleTd(tr, withButton)
	{
		var td = document.createElement('td');
		td.className = "invisible";
		if (withButton)
		{
			AddDate.button = new dijit.form.Button({
				type: 'button',
				onClick: AddDate.show,
				label: 'Add dates',
				closable: true
			}, 'cancelDates');
			if (wave.getMode() != wave.Mode.EDIT)
				AddDate.button.domNode.style.display = 'none';
			td.appendChild(AddDate.button.domNode);
		}
		else
			td.innerHTML = "&nbsp;";
		tr.appendChild(td);
	}

	var nm = 0;
	{
		var tr = document.createElement('tr');

		addUserInvisibleTd(tr, true);
		for ( var month in planny)
		{
			++nm;
			var td = document.createElement('td');
			td.className = "header month";
			var div = document.createElement('div');
			div.className = 'cell';
			div.innerHTML = monthArrayMed[parseInt(month.substr(4, 2)) - 1] + ".<br />" + month.substr(0, 4);
			div.month = month;
			div.onclick = function()
			{
				deleteMonth(this.month);
			};
			var n = 0;
			for ( var day in planny[month])
				for ( var time in planny[month][day])
					++n;
			td.colSpan = n;
			
			td.appendChild(div);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}

	var nbDays = 0;
	if (nm != 0)
	{
		{
			var tr = document.createElement('tr');
			addUserInvisibleTd(tr);
			for ( var month in planny)
				for ( var day in planny[month])
				{
					var td = document.createElement('td');
					td.className = "header day";
					var div = document.createElement('div');
					div.className = 'cell';
					var date = new Date();
					date.setFullYear(parseInt(month.substr(0, 4)), parseInt(month.substr(4, 2)) - 1, parseInt(day));
					div.innerHTML = dayArrayMed[date.getDay()] + ".<br />" + day;
					div.month = month;
					div.day = day;
					div.onclick = function()
					{
						deleteDay(this.month, this.day);
					};
					var n = 0;
					for ( var time in planny[month][day])
						++n;
					td.colSpan = n;

					td.appendChild(div);
					tr.appendChild(td);
				}
			table.appendChild(tr);
		}

		{
			var tr = document.createElement('tr');
			addUserInvisibleTd(tr);
			for ( var month in planny)
				for ( var day in planny[month])
					for ( var time in planny[month][day])
					{
						var td = document.createElement('td');
						td.className = "header time";
						var div = document.createElement('div');
						div.className = 'cell';
						div.innerHTML = time.substr(0, 2) + "h" + time.substr(2, 2);
						div.month = month;
						div.day = day;
						div.time = time;
						div.onclick = function()
						{
							deleteTime(this.month, this.day, this.time);
						};

						td.appendChild(div);
						tr.appendChild(td);
						++nbDays;
					}
			table.appendChild(tr);
		}
	}

	if (wave.getParticipants())
	{
		var participants = wave.getParticipants();
		participants.sort(function(left, right)
		{
			return left.getDisplayName().toLowerCase() > right.getDisplayName().toLowerCase();
		});

		var declaredUsers = new Array();
		if (wave.getState() && wave.getState().get('declared') && wave.getState().get('declared') != "")
			declaredUsers = wave.getState().get("declared").split(',');

		function addUserTD(tr, id, displayname, url, className)
		{
			var td = document.createElement('td');
			td.className = className;
			var div = document.createElement('div');
			div.className = 'cell';
			if (displayname.search('@') != -1)
				displayname = displayname.substr(0, displayname.search('@'));
			div.innerHTML = "<img src='" + url + "' /> <b>" + displayname + "</b>";

			if (wave.getViewer() && wave.getViewer().getId() == id)
			{
				div.onclick = function()
				{
					toggleDeclare();
				}
				tr.className += " self";
			}

			td.appendChild(div);
			tr.appendChild(td);
		}

		for ( var i = 0; i < participants.length; ++i)
			if (findInArray(declaredUsers, participants[i].getId()) != -1)
			{
				var tr = document.createElement('tr');
				addUserTD(tr, participants[i].getId(), participants[i].getDisplayName(), participants[i].getThumbnailUrl(), "user dec");

				for ( var month in planny)
					for ( var day in planny[month])
						for ( var time in planny[month][day])
						{
							var td = document.createElement('td');
							var div = document.createElement('div');
							div.className = 'cell';

							if (findInArray(planny[month][day][time], participants[i].getId()) != -1)
								td.className = "OK";
							else
								td.className = "KO";
							if (td.className == "OK" || ( wave.getViewer() && wave.getViewer().getId() == participants[i].getId()))
								div.innerHTML = "<b>OK</b>";

							if (wave.getViewer() && wave.getViewer().getId() == participants[i].getId())
							{
								div.month = month;
								div.day = day;
								div.time = time;
								div.onclick = function()
								{
									toggleOK(this);
								}

								tr.className += " self";
							}
							td.appendChild(div);
							tr.appendChild(td);
						}

				table.appendChild(tr);
			}

		for ( var i = 0; i < participants.length; ++i)
			if (findInArray(declaredUsers, participants[i].getId()) == -1)
			{
				var tr = document.createElement('tr');
				addUserTD(tr, participants[i].getId(), participants[i].getDisplayName(), participants[i].getThumbnailUrl(), "user undec");
				var td = document.createElement('td');
				td.className = "empty";
				td.colSpan = nbDays;

				if (wave.getViewer() && wave.getViewer().getId() == participants[i].getId())
				{
					tr.className += " self";

					var div = document.createElement('div');
					div.className = 'cell';

					div.onclick = function() { toggleDeclare(); }
					div.innerHTML = "Participate";
					
					td.appendChild(div);
				}
				else
					td.innerHTML = "&nbsp;";

				tr.appendChild(td);
				table.appendChild(tr);
			}
	}
	gadgets.window.adjustHeight();
}

function toggleDeclare()
{
	if (dojo.query(".small").length != 0)
		return ;
	var declaredUsers = new Array();
	if (wave.getState() && wave.getState().get('declared') && wave.getState().get('declared') != "")
		declaredUsers = wave.getState().get('declared').split(',');
	var pos = findInArray(declaredUsers, wave.getViewer().getId());
	if (pos == -1)
		declaredUsers.push(wave.getViewer().getId());
	else if (confirm("Are you sure you want to retire from this planny ?"))
	{
		delete declaredUsers[pos];

		for ( var month in planny)
			for ( var day in planny[month])
				for ( var time in planny[month][day])
				{
					var upos = findInArray(planny[month][day][time], wave.getViewer().getId());
					if (upos != -1)
						delete planny[month][day][time][upos];
				}
		wave.getState().submitValue('planny', plannyToArray().join(','));
	}
	wave.getState().submitValue('declared', declaredUsers.join(','));
}

function toggleOK(td)
{
	if (dojo.query(".small").length != 0)
		return ;

	if (planny[td.month] && planny[td.month][td.day] && planny[td.month][td.day][td.time])
	{
		var pos = findInArray(planny[td.month][td.day][td.time], wave.getViewer().getId());
		if (pos == -1)
			planny[td.month][td.day][td.time].push(wave.getViewer().getId());
		else
			delete planny[td.month][td.day][td.time][pos];
	}
	wave.getState().submitValue('planny', plannyToArray().join(','));
}

function deleteMonth(month)
{
	if (dojo.query(".small").length != 0)
		return ;
	if (wave.getMode() != wave.Mode.EDIT)
		return;
	if (planny[month] && confirm("Are you sure you want to delete " + monthArrayLong[parseInt(month.substr(4, 2)) - 1] + " " + month.substr(0, 4) + " ?"))
	{
		delete planny[month];
		wave.getState().submitValue('planny', plannyToArray().join(','));
	}
}

function deleteDay(month, day)
{
	if (dojo.query(".small").length != 0)
		return ;
	if (wave.getMode() != wave.Mode.EDIT)
		return;
	var date = new Date();
	date.setFullYear(parseInt(month.substr(0, 4)), parseInt(month.substr(4, 2)) - 1, parseInt(day));
	if (planny[month] && planny[month][day] && confirm("Are you sure you want to delete " + dayArrayLong[date.getDay()] + " " + day + " " + monthArrayLong[parseInt(month.substr(4, 2)) - 1] + " " + month.substr(0, 4) + " ?"))
	{
		delete planny[month][day];
		wave.getState().submitValue('planny', plannyToArray().join(','));
	}
}

function deleteTime(month, day, time)
{
	if (dojo.query(".small").length != 0)
		return ;
	if (wave.getMode() != wave.Mode.EDIT)
		return;
	var date = new Date();
	date.setFullYear(parseInt(month.substr(0, 4)), parseInt(month.substr(4, 2)) - 1, parseInt(day));
	if (planny[month] && planny[month][day] && planny[month][day][time] && confirm("Are you sure you want to delete " + time.substr(0, 2) + "h" + time.substr(2, 2) + " in " + dayArrayLong[date.getDay()] + " " + day + " " + monthArrayLong[parseInt(month.substr(4, 2)) - 1] + " " + month.substr(0, 4) + " ?"))
	{
		delete planny[month][day][time];
		wave.getState().submitValue('planny', plannyToArray().join(','));
	}
}

function setPart()
{
	if (dojo.byId('planny'))
		createPlannyTable();
	gadgets.window.adjustHeight();
}

function modeChanged()
{
	createPlannyTable();
	if (wave.getMode() == wave.Mode.DIFF_ON_OPEN)
		return;
	if (wave.getMode() == wave.Mode.EDIT)
	{
		AddDate.button.domNode.style.display = "inline";
		dojo.byId('planny').className = "edit";
	}
	else
	{
		AddDate.hide();
		AddDate.button.domNode.style.display = "none";
		dojo.byId('planny').className = "";
	}
	gadgets.window.adjustHeight();
}

function stateChanged()
{
	if (wave.getState().get('planny') && wave.getState().get('planny') != "")
	{
		array = wave.getState().get('planny').split(',');
		array.sort();
		arrayToPlanny(array);
		createPlannyTable();
	}
	else
	{
		planny = {};
		createPlannyTable();
	}
}

var GInit = false;
var DInit = false;
function init()
{
	if (GInit && DInit)
	{
		document.body.className = "soria";
		
		AddDate.cal = new dojox.widget.Calendar({}, dojo.byId('calendar'));
		AddDate.addButton = new dijit.form.Button({ onClick: AddDate.add, id: 'addDatesButton', disabled: true }, '_addDates');
		new dijit.form.Button({ onClick: AddDate.hide, id: 'cancelDatesButton' }, '_cancelDates');

		createPlannyTable();

		var table = dojo.create('table', { className: 'hourMenu' }, dojo.byId('hours'));
		for (var l = 0; l < 4; ++l)
		{
			var tr = dojo.create('tr', {}, table);
			for (var h = 0; h < 6; ++h)
			{
				var nodeId = "_hourTR" + (l * 6 + h);
				var td = dojo.create(
					'td',
					{
						className: 'hourMenu',
						innerHTML: zeroFill2(l * 6 + h) + "h",
						id: nodeId,
						onclick: function() { AddDate.timeClicked(this.innerHTML + "00"); }
					},
					tr
				);

				var menu = new dijit.Menu({
					targetNodeIds: [nodeId],
					class: 'plannyMenu'
				});
				menu.addChild(new dijit.MenuItem({ label: zeroFill2(l * 6 + h) + "h15", onClick: function() { AddDate.timeClicked(this.label); } }));
				menu.addChild(new dijit.MenuItem({ label: zeroFill2(l * 6 + h) + "h30", onClick: function() { AddDate.timeClicked(this.label); } }));
				menu.addChild(new dijit.MenuItem({ label: zeroFill2(l * 6 + h) + "h45", onClick: function() { AddDate.timeClicked(this.label); } }));
			}
		}
		
		wave.setParticipantCallback(setPart);
		wave.setModeCallback(modeChanged);
		wave.setStateCallback(stateChanged);
	}
}
gadgets.util.registerOnLoadHandler(function() { GInit = true; init() });
dojo.addOnLoad(function() { DInit = true; init() })
