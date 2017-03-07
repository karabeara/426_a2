// abstraction layer around three.js scene
// handles materials and lighting
// also provides interface for adding/removing objects (used in main.js)

"use strict";
var Scene = Scene || {
    _scene     : undefined,
    _materials : {},
    _axis      : undefined,
    _grid      : undefined,
    _light1    : undefined,
    _idLabels  : [],
    models    : {},
};

// creates default scene
Scene.create = function() {
    Scene._scene  = new THREE.Scene();
    Scene.setupLighting();
    Scene.setupMaterials();
    Scene.addAxis();
    Scene.addGrid();
};

Scene.setupLighting = function() {
    var light = new THREE.AmbientLight( 0x303030 ); // soft white light

    this._light1   = new THREE.PointLight( 0xcdcdcd );
    this._light1.position.set( 8, 6, 7 );

    Scene._scene.add( light );
    Scene._scene.add( this._light1 );
};

Scene.setupMaterials = function() {
    var selectedColor = 0x4a27ed;

    Scene._materials = {
        main: new THREE.MeshLambertMaterial( { color : 0x85bb6a, side : THREE.DoubleSide } ),
        faceNormals: new THREE.LineBasicMaterial( {color: 0xe9ad45, linewidth:4, opacity:0.75, transparent:true }),
        vertexNormals: new THREE.LineBasicMaterial( {color: 0x4858cf, linewidth:4, opacity:0.75, transparent:true }),
        vertexColors: new THREE.MeshBasicMaterial( { color: 0xffffff } ),
        wireframe: new THREE.LineBasicMaterial( {color: 0x030303, linewidth:5 }),
        selectedFaces: new THREE.MeshLambertMaterial( { color : selectedColor, side : THREE.DoubleSide  } ),
        vertices: new THREE.PointCloudMaterial( { 
            vertexColors: THREE.VertexColors,
            alphaTest: 0.5,
            transparent: false,
            size: 30, // NOTE: must update vertDispRadius in renderer.js to match this
            sizeAttenuation: false,
            map: THREE.ImageUtils.loadTexture( "images/circle.png" )
        } ),
        selectedVertices: new THREE.PointCloudMaterial( { 
            color: selectedColor,
            vertexColors: false,
            alphaTest: 0.5,
            transparent: false,
            size: 30, // NOTE: must update vertDispRadius in renderer.js to match this
            sizeAttenuation: false,
            map: THREE.ImageUtils.loadTexture( "images/circle.png" )
        } ),
        structureVisualization: new THREE.LineBasicMaterial( {color: 0xff0000, linewidth:2, opacity:0.75, transparent:true }),
        edgeStructureVisualization: new THREE.LineBasicMaterial( {color: 0xffff00, linewidth:2, opacity:0.75, transparent:true }),
    };
};

Scene.getMaterial = function( id ) {
    return Scene._materials[id];
};

Scene.addMaterial = function( material ) {
    Scene._materials.push ( material );
};

// Objects
Scene.addObject = function ( object, objectName ) {
    object.castShadow    = true;
    object.receiveShadow = false;
    object.name = objectName;
    Scene._scene.add( object );
};

Scene.removeObject = function ( object ) {
    Scene._scene.remove( object );
};

// axis and grid
Scene.addAxis = function() {
    var r = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.850, 0.325, 0.098 ), linewidth: 4, opacity: 0.5, transparent: true });
    var g = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.466, 0.674, 0.188 ), linewidth: 4, opacity: 0.5, transparent: true });
    var b = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.000, 0.447, 0.741 ), linewidth: 4, opacity: 0.5, transparent: true });

    var x_axis_geo = new THREE.Geometry();
    var y_axis_geo = new THREE.Geometry();
    var z_axis_geo = new THREE.Geometry();
    x_axis_geo.vertices.push( new THREE.Vector3( -10.5, 0, 0 ) );
    x_axis_geo.vertices.push( new THREE.Vector3(  10.5, 0, 0 ) );

    y_axis_geo.vertices.push( new THREE.Vector3( 0, -10.5, 0 ) );
    y_axis_geo.vertices.push( new THREE.Vector3( 0,  10.5, 0 ) );

    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0, -10.5 ) );
    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0,  10.5 ) );

    var x_axis = new THREE.Line( x_axis_geo, r );
    var y_axis = new THREE.Line( y_axis_geo, g );
    var z_axis = new THREE.Line( z_axis_geo, b );

    this._scene.add( x_axis );
    this._scene.add( y_axis );
    this._scene.add( z_axis );

    this._axis = [x_axis, y_axis, z_axis];
};

Scene.addGrid = function() {
    var w = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.95, 0.95, 0.95 ), linewidth: 5, opacity: 0.3, transparent: true });

    var grid_geo = new THREE.Geometry();
    for ( var i = -10; i <= 10 ; ++i ) {
        if ( i === 0 ) continue;
        grid_geo.vertices.push( new THREE.Vector3( i,  0, -10 ) );
        grid_geo.vertices.push( new THREE.Vector3( i,  0,  10 ) );
        grid_geo.vertices.push( new THREE.Vector3( -10, 0, i ) );
        grid_geo.vertices.push( new THREE.Vector3( 10,  0,  i ) );
    }
    var grid = new THREE.Line( grid_geo, w, THREE.LinePieces );
    this._scene.add( grid );


    this._grid = grid;
};

Scene.showGrid = function() {
    this._grid.visible = true;
};

Scene.hideGrid = function() {
    this._grid.visible = false;
};

Scene.showVertDots = function() {
    Main.models.vertices.visible = true;
};

Scene.hideVertDots = function() {
    Main.models.vertices.visible = false;
};

Scene.addIdLabel = function(label) {
    this._scene.add(label);
    this._idLabels.push(label);
}

Scene.clearIdLabels = function() {
    for (var i = 0; i < this._idLabels.length; i++) {
        this._scene.remove(this._idLabels[i]);
    }
    this._idLabels = [];
};

Scene.showIdLabels = function() {
    for (var i = 0; i < this._idLabels.length; i++) {
        this._idLabels[i].visible = true;
    }
};

Scene.hideIdLabels = function() {
    for (var i = 0; i < this._idLabels.length; i++) {
        this._idLabels[i].visible = false;
    }
};

Scene.showAxes = function() {
    this._axis[0].visible = true;
    this._axis[1].visible = true;
    this._axis[2].visible = true;
};

Scene.hideAxis = function(){
    this._axis[0].visible = false;
    this._axis[1].visible = false;
    this._axis[2].visible = false;
};

// FIXME - needs to be redone for new objcet storage scheme
Scene.showVertexColors = function() {
    var material = this.getMaterial("vertexColors");
    Scene._scene.getObjectByName("main").material = material;
    material.vertexColors   = THREE.VertexColors;
    material.needsUpdate    = true;
};

Scene.hideVertexColors = function() {
    var material = this.getMaterial("main");
    Scene._scene.getObjectByName("main").material = material;
};

// changes color of default material
Scene.changeColor = function( newColor ) {
    this._materials.main.color = new THREE.Color( newColor );
};

// based on https://stemkoski.github.io/Three.js/Labeled-Geometry.html
function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ? 
        parameters["fontface"] : "Arial";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
        parameters["fontsize"] : 60;
    
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
        parameters["borderThickness"] : 4;
    
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    var canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    var context = canvas.getContext('2d');
    // context.textAlign = "center";
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    canvas.width = textWidth + borderThickness * 2;
    canvas.height = fontsize * 1.4 + borderThickness * 2;
    context = canvas.getContext("2d");
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    // context.fillText( message, 0, canvas.height/2);
    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( { 
        map: texture,
        useScreenCoordinates: false,
    } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(0.1, 0.1, 1.0);
    return sprite;  
}

// draws rounded rectangles. from https://stemkoski.github.io/Three.js/Labeled-Geometry.html
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
}
