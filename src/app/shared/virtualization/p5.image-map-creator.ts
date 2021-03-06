import { ImageMap } from "./class.image-map";
import { BgLayer } from "./p5.bg-layer";
import { Area, AreaCircle, AreaRect, AreaPoly, AreaEmpty } from "./class.area";
import { Coord } from "./class.coord";
import { Selection } from "./class.selection";
import { openWindow } from "./utils";
import * as download from "downloadjs";
//@ts-ignore no types for this lib
import UndoManager from "undo-manager";
//@ts-ignore no types for this lib
import QuickSettings from "quicksettings";
//@ts-ignore no types for this lib
import * as ContextMenu from "./lib/contextmenu/contextmenu";
import "./lib/contextmenu/contextmenu.css";
//@ts-ignore strange way to import but it's working
import p5 = require("p5");
import { Component, EventEmitter, Output } from '@angular/core';
import { ZoneType } from '../enums/zoneType.enumeration';

export type Tool = "rectangulo" | "circulo" | "poligono" | "seleccionar" | "eliminar";/* | "test"*/;
export type Image = {
	data: p5.Image | null,
	file: p5.File | null,
};
export type ToolLabel = {
	key: string,
	value: Tool,
};
export type View = { scale: number, transX: number, transY: number, };
export type Zoom = { min: number, max: number, sensativity: number, };

export class Save {
	constructor(public version: string, public map: ImageMap) { }
}

@Component({
	selector: 'infini-imagemapcreator'
})
export class imageMapCreator {

	protected width: number;
	protected height: number;
	protected tool: Tool;
	protected drawingTools: Tool[];
	protected settings: any;
	protected externalCoordenates: any;
	public lastAction: string;
	public editionMode: boolean = false;
	protected menu = {
		SetUrl: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.setAreaUrl(area); },
			label: "Set url",
		},
		SetTitle: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.setAreaTitle(area); },
			label: "Set title",
		},
		Delete: (target: Element, key: any, item: HTMLElement, area: Area) => { this.deleteArea(area); },
		MoveFront: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.moveArea(area, -1); },
			enabled: true,
			label: "Move Forward",
		},
		MoveBack: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.moveArea(area, 1); },
			enabled: true,
			label: "Move Backward",
		}
	};
	protected tempArea: AreaEmpty;
	protected selection: Selection;
	protected hoveredArea: Area | null;
	protected hoveredPoint: Coord | null;
	public map: ImageMap;
	protected undoManager: any;
	protected img: Image;
	public view: View;
	protected zoomParams: Zoom;
	protected magnetism: boolean;
	protected fusion: boolean;
	protected tolerance: number;
	protected bgLayer: BgLayer;
	public p5: p5;
	public selectedAreaId = null;
	public imageDropped: boolean = false;
	public itemURL: string;
	public sensorTypeId: string;
	public imgtest: any;
	public imagenessensores: {};
	public mouseAction = "";
	public typeConfig: ZoneType = null; // Para configurar sensores o zonas



	/**
	 * Constructor
	 * @param {string} elementId id of the html container
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(elementId: string, width: number = 600, height: number = 450, typeConfig: ZoneType) {

		const element = document.getElementById(elementId);
		if (!element) throw new Error('HTMLElement not found');
		this.width = width;
		this.height = height;
		this.typeConfig = typeConfig;
		if(this.typeConfig == ZoneType.zv){
			this.tool = "rectangulo";
			this.drawingTools = ["rectangulo", "circulo", "poligono", "seleccionar"];
		}else if(this.typeConfig == ZoneType.se){
			this.tool = "seleccionar";
			this.drawingTools = ["seleccionar"];
		}
		this.settings;
		this.tempArea = new AreaEmpty();
		this.selection = new Selection();
		this.hoveredArea = null;
		this.hoveredPoint = null;
		this.map = new ImageMap(width, height);
		this.undoManager = new UndoManager();
		this.img = { data: null, file: null };
		this.view = {
			scale: 1,
			transX: 0,
			transY: 0
		}
		this.zoomParams = {
			min: 0.03,
			max: 3,
			sensativity: 0.001
		}
		this.magnetism = true;
		this.fusion = false;
		this.tolerance = 6;
		this.bgLayer = new BgLayer(this);
		// Must be the last instruction of the constructor.
		this.p5 = new p5(this.sketch.bind(this), element);
	}

	//---------------------------- p5 Sketch ----------------------------------

	/**
	 * Override p5 methods 
	 * @param {p5} p5
	 */
	private sketch(p5: p5): void {
		// Set this.p5 also in sketch() (fix for #30).
		this.p5 = p5;

		p5.setup = this.setup.bind(this);
		p5.draw = this.draw.bind(this);

		p5.mousePressed = this.mousePressed.bind(this);
		p5.mouseDragged = this.mouseDragged.bind(this);
		p5.mouseReleased = this.mouseReleased.bind(this);
		p5.mouseWheel = this.mouseWheel.bind(this);
		//@ts-ignore p5 types didn't specify the KeyBoardEvent nor the boolean return type
		p5.keyPressed = this.keyPressed.bind(this);
	}

	//---------------------------- p5 Functions ----------------------------------

	/* PRECARGAR LAS IMAGENES SIEMPRE PARA QUE SE VISUALIZEN EN EL CANVAS */
	public preload() {
		this.editionMode = false;
		this.mouseAction = "";
		this.imagenessensores = [];
		this.map.getAreas().forEach((a: Area) => {
			if (a.type == ZoneType.se) {
				let img = this.p5.loadImage(a.img);
				let id = a.id;
				let obj = {
					"id": a.id,
					"img": img
				};
				this.imagenessensores[id] = img;
			}
		});

		let dragableitems = document.getElementById('drag-items');
		switch (this.typeConfig) {
			case ZoneType.se:
				dragableitems.hidden = false;
				this.tool = "seleccionar";
				let self = this;
				dragableitems.addEventListener('dragstart', function (e: any) {
					self.itemURL = e.target?.src;
					self.sensorTypeId = e.target?.id;
				});
				break;
			case ZoneType.zv:
				dragableitems.hidden = true;
				break;
		}
	}

	private setup(): void {
		let canvas = this.p5.createCanvas(this.width, this.height);
		canvas.drop(this.handeFile.bind(this)).dragLeave(this.onLeave.bind(this)).dragOver(this.onOver.bind(this)).doubleClicked(this.doubleClicked.bind(this));
		//@ts-ignore p5 types does not specify the canvas attribute
		this.settings = QuickSettings.create(this.p5.width + 5, 0, "Virtualizador", this.p5.canvas.parentElement)
			.setDraggable(false)
			.addText("Nombre del plano", "", (v: string) => { this.map.setName(v) })
			.addDropDown("Tipo de selección", this.drawingTools /*["rectangulo", "circulo", "poligono", "seleccionar"]*//*, "eliminar", "test"]*/, (v: ToolLabel) => { this.setTool(v.value) })
		//.addBoolean("Default Area", this.map.hasDefaultArea, (v: boolean) => { this.setDefaultArea(v) })
		//.addButton("Deshacer", this.undoManager.undo)
		//.addButton("Rehacer", this.undoManager.redo)
		//.addButton("Borrar todo", this.clearAreas.bind(this))
		//.addButton("Cargar Zonas", () => { this.loadCoordenates(this.externalCoordenates); })
		//.addButton("Generate Html", () => { this.settings.setValue("Output", this.map.toHtml()) })
		//.addButton("Generate Svg", () => { this.settings.setValue("Output", this.map.toSvg()) })
		//.addTextArea("Output")
		//.addButton("Guardar", this.save.bind(this));
		//@ts-ignore Fix for oncontextmenu
		this.p5.canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); });
		this.p5.canvas.addEventListener("drop", (e) => { e.preventDefault(); this.dropSensor(e); })
		//@ts-ignore Fix for middle click mouse down triggers scroll on windows
		this.p5.canvas.addEventListener("mousedown", (e) => { e.preventDefault(); });
		//@ts-ignore Select all onclick on the Output field
		//document.getElementById("Output").setAttribute("onFocus", "this.select();");



	}

	/*public saveCoordenates(): any {
		this.map.setAreas(this.externalCoordenates);
	}

	public loadCoordenates(coords: any): any {
		this.externalCoordenates = coords;
		this.map.setAreas(coords);
	}*/

	private draw(): void {
		this.updateTempArea();
		this.updateHovered();
		this.setCursor();
		//this.setOutput();
		this.setBackground();
		this.setTitle(this.hoveredArea);
		this.p5.translate(this.view.transX, this.view.transY);
		this.p5.scale(this.view.scale);
		this.drawImage();
		this.bgLayer.display();
		this.drawAreas();
	}

	//------------------------------ p5 Events -----------------------------------

	private mousePressed(): void {
		console.log("mouse pressed");
		this.mouseAction = "pressed"; // Soltar el botón
		if (!this.editionMode) {
			if (this.mouseIsHoverSketch()) {
				let coord = this.drawingCoord();
				if (this.p5.mouseButton == this.p5.LEFT && !ContextMenu.isOpen()) {
					switch (this.tool) {
						case "circulo":
						case "rectangulo":
							this.setTempArea(coord);
							break;
						case "poligono":
							let areaPoly = this.tempArea as AreaPoly;
							if (areaPoly.isEmpty()) {
								this.setTempArea(coord);
							} else if (areaPoly.isClosable(this.mCoord(), this.tolerance / this.view.scale)) {
								areaPoly.close();
								if (areaPoly.isValidShape()) {
									this.createArea(areaPoly);
									this.lastAction = "add";
								} else {
								}
								this.tempArea = new AreaEmpty();
							} else {
								this.tempArea.addCoord(this.mCoord());
							}
							break;
						case "seleccionar":
							if (this.hoveredPoint !== null) {
								this.selection.addPoint(this.hoveredPoint);
								this.selection.registerArea(this.hoveredArea!);
								this.selection.resetOrigin(this.hoveredPoint);
								this.lastAction = "select";
							} else if (this.hoveredArea !== null) {
								this.selection.addArea(this.hoveredArea);
								this.selection.resetOrigin(this.mCoord());
								this.lastAction = "select";
								this.selectedAreaId = this.hoveredArea.getIdCoordenate();
							}
							break;
					}
				}
			}
		}
	}

	private mouseDragged(): void {
		console.log("mouse dragged");
		this.mouseAction = "dragged"; // Arrastras el elemento
		if (this.mouseIsHoverSketch() && !ContextMenu.isOpen()) {
			if (this.p5.mouseButton == this.p5.LEFT) {
				switch (this.tool) {
					case "seleccionar":
						this.selection.setPosition(this.drawingCoord());
						this.lastAction = "select";
						break;
				}
			} else if (this.p5.mouseButton == this.p5.CENTER) {
				console.log("mouse dragged ELSE IF");
				this.view.transX += this.p5.mouseX - this.p5.pmouseX;
				this.view.transY += this.p5.mouseY - this.p5.pmouseY;
			}
		}
	}

	private mouseReleased(e: MouseEvent): void {
		console.log("mouse released");
		this.mouseAction = "released"; // Soltar el botón
		if (!this.editionMode) {
			switch (this.tool) {
				case "rectangulo":
				case "circulo":
					if (this.tempArea.isValidShape()) {
						this.createArea(this.tempArea);
						this.map.getAreas();
						this.lastAction = "add";
					} else {

					}
					this.tempArea = new AreaEmpty();
					break;
				case "seleccionar":
					let selection = this.selection;
					if (!selection.isEmpty()) {
						this.lastAction = "select";
						let move = this.selection.distToOrigin();
						this.undoManager.add({
							undo: () => selection.move(move.invert()),
							redo: () => selection.move(move),
						});
					}
					this.selection = new Selection();
					break;
			}
			this.onClick(e);
			this.bgLayer.disappear();
		}
	}

	private mouseWheel(e: MouseWheelEvent): boolean {
		console.log("mouse zoom");
		this.mouseAction = "zoom"; // Soltar el botón
		if (this.mouseIsHoverSketch()) {
			let coefZoom = this.view.scale * this.zoomParams.sensativity * - e.deltaY;
			this.zoom(coefZoom);
			return false;
		}
		return true;
	}

	private keyPressed(e: KeyboardEvent): boolean {
		if (e.composed && e.ctrlKey) {
			switch (e.key) {
				case 's':
					this.save();
					break;
				case 'z':
					this.undoManager.undo();
					break;
				case 'y':
					this.undoManager.redo();
					break;
				default:
					return true;
			}
			return false;
		} else if (
			this.tool == "poligono" &&
			//@ts-ignore p5 types didn't specify the ESCAPE keycode
			e.keyCode == this.p5.ESCAPE
		) {
			this.tempArea = new AreaEmpty();
			return false;
		}
		return true;
	}

	//---------------------------- Functions ----------------------------------

	trueX(coord: number): number {
		return (coord - this.view.transX) / this.view.scale;
	}

	trueY(coord: number): number {
		return (coord - this.view.transY) / this.view.scale;
	}

	mX(): number {
		return this.trueX(this.p5.mouseX);
	}

	mY(): number {
		return this.trueY(this.p5.mouseY);
	}

	/**
	 * Get the true coordinate of the mouse relative to the imageMap
	 */
	mCoord(): Coord {
		return new Coord(this.mX(), this.mY());
	}

	/**
	 * Get the coordinate of the mouse for drawing
	 */
	drawingCoord(): Coord {
		let coord = this.mCoord();
		coord = this.magnetism ? this.hoveredPoint ? this.hoveredPoint : coord : coord;
		if (!this.fusion) {
			coord = coord.clone();
		}
		return coord;
	}

	mouseIsHoverSketch(): boolean {
		return this.p5.mouseX <= this.p5.width && this.p5.mouseX >= 0 && this.p5.mouseY <= this.p5.height && this.p5.mouseY >= 0;
	}

	/**
	 * Sets hoveredPoint and hoveredArea excluding currently selected Areas
	 */
	updateHovered(): void {
		this.hoveredPoint = null;
		let allAreas = this.map.getAreas();
		let area = allAreas.find((a: Area): boolean => {
			if (this.selection.containsArea(a)) {
				return false;
			}
			/*if (this.tool != "test") {
				let point = a.isOverPoint(this.mCoord(), this.tolerance / this.view.scale)
				if (point && !this.selection.containsPoint(point)) {
					this.hoveredPoint = point;
					return true;
				}
			}*/
			if (a.isOver(this.mCoord())) {
				return true;
			}
			return false;
		});
		if (this.p5.mouseIsPressed) return;
		this.hoveredArea = area ? area : null;
	}

	onClick(event: MouseEvent): void {
		console.log("click");
		if (this.mouseIsHoverSketch()) {
			if (this.hoveredArea) {
				if (this.p5.mouseButton == this.p5.RIGHT) {
					this.selection.addArea(this.hoveredArea);
					this.menu.MoveFront.enabled = !(this.map.isFirstArea(this.hoveredArea.id) || this.hoveredArea.getShape() == 'default');
					this.menu.MoveBack.enabled = !(this.map.isLastArea(this.hoveredArea.id) || this.hoveredArea.getShape() == 'default');
					ContextMenu.display(event, this.menu, {
						position: "click",
						data: this.hoveredArea
					});
					// return false; // doesn't work as expected
				} else if (this.p5.mouseButton == this.p5.LEFT && !ContextMenu.isOpen()) {
					switch (this.tool) {
						/*case "test":
							openWindow(this.hoveredArea.getHref());
							break;*/
						case "eliminar":
							this.deleteArea(this.hoveredArea);
							break;
					}
				} else {

				}
			}
		}
		this.selection.clear();
	}

	onOver(evt: MouseEvent): void {
		this.bgLayer.appear();
		evt.preventDefault();
	}

	onLeave(): void {
		this.bgLayer.disappear();
	}

	dropSensor(evt): void {
		this.imgtest = this.p5.loadImage(this.itemURL);
		this.tempArea = new AreaRect();
		//this.tempArea.setShape("rect")
		let coord = this.drawingCoord(); // origen izq (3.4)
		let coord1 = new Coord(coord.x + 50, coord.y); // Derecha (3.5)
		let coord2 = new Coord(coord.x, coord.y + 50); // Arriba (4.4)
		let coord3 = new Coord(coord.x + 50, coord.y + 50); // Derecha arriba (4.5)

		this.setTempArea(coord);
		this.tempArea.addCoord(coord);
		this.tempArea.addCoord(coord1);
		this.tempArea.addCoord(coord3);
		this.tempArea.addCoord(coord2);

		this.createArea(this.tempArea);
		this.lastAction = "add";
		this.tempArea = new AreaEmpty();

		//this.onClick(evt);
		this.bgLayer.disappear();
		//this.imgtest = null;
		//this.drawAreas();
	}

	doubleClicked(evt: MouseEvent) {
		evt.preventDefault();
		console.log("doble click");
		try {
			this.selection.addArea(this.hoveredArea);
			this.selection.resetOrigin(this.mCoord());
			let allAreas = this.map.getAreas();
			let area = allAreas.find((a: Area): boolean => {
				if (this.selection.containsArea(a)) {
					this.selectedAreaId = a.getIdCoordenate();
					return true;
				}
				if (a.isOver(this.mCoord())) {
					this.selectedAreaId = a.getIdCoordenate();
					return true;
				}
				return false;
			});

			if (area) {
				this.lastAction = "openmodal";
			} else {
				this.lastAction = null;
				this.selectedAreaId = null;
			}
		} catch (e) {
			console.log("No area seleccionada");
		}
	}

	handeFile(file: p5.File): void {
		this.imageDropped = true;
		if (file.type == "image") {
			this.img.data = this.p5.loadImage(file.data, img => this.resetView(img));
			this.img.file = file.file;
			if (!this.map.getName()) {
				this.map.setName(file.name);
				this.settings.setValue("Nombre del plano", this.map.getName());
			}
		} else if (file.subtype == 'json') {
			fetch(file.data)
				.then(res => res.blob())
				.then(blob => {
					let reader = new FileReader();
					reader.onload = () => {
						let json = reader.result;
						if (typeof (json) == "string") {
							this.importMap(json);
						}
					};
					reader.readAsText(blob);
				});
		}
		this.bgLayer.disappear();
	}

	resetView(img: p5.Image): void {
		this.view.scale = 1;
		this.view.transX = 0;
		this.view.transY = 0;
		let xScale = this.p5.width / img.width;
		let yScale = this.p5.height / img.height;
		if (xScale < this.view.scale)
			this.view.scale = xScale;
		if (yScale < this.view.scale)
			this.view.scale = yScale;
		this.map.setSize(img.width, img.height);
	}

	zoom(coef: number): void {
		let newScale = this.view.scale + coef;
		if (newScale > this.zoomParams.min && newScale < this.zoomParams.max) {
			let mouseXToOrigin = this.mX();
			let mouseYToOrigin = this.mY();
			let transX = mouseXToOrigin * coef;
			let transY = mouseYToOrigin * coef;

			this.view.scale = newScale;
			this.view.transX -= transX;
			this.view.transY -= transY;
		}
	}

	drawImage(): void {
		if (this.img.data)
			this.p5.image(this.img.data, 0, 0, this.img.data.width, this.img.data.height);
	}

	drawAreas(): void {
		let allAreas = [this.tempArea].concat(this.map.getAreas());
		for (let i = allAreas.length; i--;) {
			let area = allAreas[i];
			this.setAreaStyle(area);
			if (area.isDrawable()) {
				let img = undefined;
				if (area.type == ZoneType.se) {
					img = this.imagenessensores[area.id];
				}
				area.display(this.p5, img);
			}
		}
		if (this.hoveredPoint) {
			let point = this.hoveredPoint;
			this.p5.fill(0);
			this.p5.noStroke();
			this.p5.ellipse(point.x, point.y, 6 / this.view.scale)
		}
	}

	setTool(value: Tool): void {
		this.tool = value;
		this.tempArea = new AreaEmpty();
	}

	setCursor(): void {
		if (this.drawingTools.includes(this.tool)) {
			switch (this.tool) {
				case "poligono":
					let areaPoly = this.tempArea as AreaPoly
					if (!areaPoly.isEmpty() && areaPoly.isClosable(this.mCoord(), 5 / this.view.scale)) {
						this.p5.cursor(this.p5.HAND);
						break;
					}
				default:
					this.p5.cursor(this.p5.CROSS);
			}
		} else {
			this.p5.cursor(this.p5.ARROW);
			if (this.hoveredArea) {
				switch (this.tool) {
					//case "test":
					case "eliminar":
						this.p5.cursor(this.p5.HAND);
						break;
					case "seleccionar":
						if (!this.hoveredPoint) {
							this.p5.cursor(this.p5.MOVE);
						}
						break;
				}
			}
		}
	}

	/*setOutput(): void {
		switch (this.tool) {
			case "test":
			case "select":
				if (this.mouseIsHoverSketch()) {
					let href = this.hoveredArea ? this.hoveredArea.getHrefVerbose() : "none";
					this.settings.setValue("Output", href);
				}
				break;
		}
	}*/

	setBackground(): void {
		this.p5.background(200);

		if (!this.img.data) {
			this.p5.noStroke();
			this.p5.fill(0);
			this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
			this.p5.textSize(15);
			let text = 'Arrastra una imagen para comenzar a virtualizar zonas o sensores';
			this.p5.text(text, this.p5.width / 2, this.p5.height / 2);
		}
	}

	/**
	 * Set the title of the canvas from an area
	 */
	setTitle(area: Area | null): void {
		if (/*this.tool == "test" &&*/ area && area.getTitle()) {
			//@ts-ignore p5 types does not specify the canvas attribute
			this.p5.canvas.setAttribute("title", area.getTitle());
		} else {
			//@ts-ignore p5 types does not specify the canvas attribute
			this.p5.canvas.removeAttribute("title");
		}
	}

	setAreaStyle(area: Area): void {
		let color = this.p5.color(19, 236, 226, 178);
		if (area.getType() == ZoneType.zv) { // zona virtual
			color = this.p5.color(233, 236, 19, 178);
		}
		if (area.getType() == ZoneType.pe) { // punto encuentro
			color = this.p5.color(255, 0, 0, 178);
		}
		if (area.getType() == ZoneType.se) { // sensor
			color = undefined;
		}
		if (((this.tool == "eliminar" || this.tool == "seleccionar") &&
			this.mouseIsHoverSketch() &&
			area == this.hoveredArea) ||
			this.selection.containsArea(area)
		) {
			color = this.p5.color(255, 200, 200, 178); // highlight (set color red)
		}
		if (color != undefined) {
			this.p5.fill(color);
			this.p5.strokeWeight(1 / this.view.scale);
			this.p5.textStyle(this.p5.BOLD);
			this.p5.stroke(0);
		} else {
			this.p5.noFill();
		}

	}

	setTempArea(coord: Coord): void {
		let coords = [coord];
		switch (this.tool) {
			case "rectangulo":
				this.tempArea = new AreaRect(coords);
				break;
			case "circulo":
				this.tempArea = new AreaCircle(coords);
				break;
			case "poligono":
				this.tempArea = new AreaPoly(coords);
				this.tempArea.addCoord(coord);
				break;
		}
	}

	updateTempArea(): void {
		let coord = this.drawingCoord();
		if (!this.tempArea.isEmpty()) {
			this.tempArea.updateLastCoord(coord);
		}
	}

	exportMap(): string {
		return JSON.stringify(new Save("1", this.map), function (key, value) {
			if (value instanceof ImageMap && !(this instanceof Save)) {
				return value.getName();
			}
			return value;
		});
	}

	save(): void {
		this.externalCoordenates = this.map.getAreas();
		this.clearAreas();
		//@ts-ignore encoding options for Chrome
		//let blob = new Blob([this.exportMap()], { encoding: "UTF-8", type: "text/plain;charset=UTF-8" })
		//download(blob, `${this.map.getName()}.map.json`, 'application/json')
	}

	importMap(json: string): void {
		let object = JSON.parse(json);
		let objectMap = object.map;
		this.map.setFromObject(objectMap);
		if (objectMap.name != undefined) {
			this.settings.setValue("Nombre del plano", objectMap.name);
		}
		if (objectMap.hasDefaultArea != undefined) {
			//this.settings.setValue("Default Area", objectMap.hasDefaultArea);
		}
		this.reset();
		this.preload();
	}

	/**
	 * Add an area to the imageMap object
	 */
	createArea(area: Area): void {
		this.map.addArea(area);
		this.undoManager.add({
			undo: () => area = this.map.shiftArea()!,
			redo: () => this.map.addArea(area, false),
		});
	}

	/**
	 * remove an area from the imageMap object
	 */
	deleteArea(area: Area): void {
		let id = area.id;
		if (id === 0) {
			this.settings.setValue("Default Area", false);
		} else {
			let index = this.map.rmvArea(id);
			this.undoManager.add({
				undo: () => this.map.insertArea(area, index),
				redo: () => this.map.rmvArea(id),
			});
		}
	}

	/**
	 * Move an area forward or backward
	 */
	moveArea(area: Area, direction: number): void {
		if (this.map.moveArea(area.id, direction) !== false) {
			this.undoManager.add({
				undo: () => this.map.moveArea(area.id, -direction),
				redo: () => this.map.moveArea(area.id, direction),
			});
		}
	}

	/**
	 * Set the url of an area
	 */
	setAreaUrl(area: Area): void {
		let href = area.getHref();
		let input = prompt("Enter the pointing url of this area", href ? href : "http://");
		if (input) {
			area.setHref(input);
			this.undoManager.add({
				undo: () => area.setHref(href),
				redo: () => area.setHref(input!),
			});
		}
	}

	/**
	 * Set the title of an area
	 */
	setAreaTitle(area: Area): void {
		let title = area.getTitle();
		let input = prompt("Enter the title of this area", title ? title : "");
		if (input) {
			area.setTitle(input);
			this.undoManager.add({
				undo: () => area.setTitle(title),
				redo: () => area.setTitle(input!),
			});
		}
	}

	setDefaultArea(bool: boolean): void {
		this.map.setDefaultArea(bool);
		this.undoManager.add({
			undo: () => {
				this.map.setDefaultArea(!bool); // semble redondant
				this.settings.setValue("Default Area", !bool)
			},
			redo: () => {
				this.map.setDefaultArea(bool); // semble redondant
				this.settings.setValue("Default Area", bool)
			}
		});
	}

	clearAreas(): void {
		let areas = this.map.getAreas(false);
		this.map.clearAreas();
		this.undoManager.add({
			undo: () => this.map.setAreas(areas),
			redo: () => this.map.clearAreas(),
		});
	}

	reset(): void {
		this.undoManager.clear();
	}

	public getSelection() {
		return this.selection;
	}

	public clearSelection() {
		this.selection = new Selection();
	}

	public getImage() {
		return this.img;
	}

	public getSensorTypeId() {
		return this.sensorTypeId;
	}

	public setImage(img) {
		this.img.data = this.p5.loadImage(img, imgg => this.resetView(imgg));
	}

	public setTypeConfig(type) {
		this.typeConfig = type;
	}


	/* Busca un área cuando se hace over sobre el listado de zonas configuradas y la ilumina */
	public searchArea(id) {
		if (id == null) {
			this.clearSelection();
		} else {
			let areaIndex = this.map.findAreaByUuid(id);
			let area = this.map.getAreas()[areaIndex];
			this.selection.addArea(area);
		}
	}
}