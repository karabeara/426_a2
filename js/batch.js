// This is the main javascript file used for the batch version
// of the mesh processing assignment for COS426.
//
// Unless you are expecially interested, do not bother to
// read it closely. It's mostly just boilerplate to handle
// processing the comamnds in the URL and load inages.

// this construction helps avoid polluting the global name space
var Batch = Batch || {
    mesh : undefined,
    _model : [], // should that be grouped -> I believe so.
};


// edit below to change the viewing options
Batch.displayOptions = {
    showGrid  : true,
    showAxes  : true,
    meshColor : "#66cc33",
    showVC    : false,
}

Batch.createModel = function() {
    var start = new Date().getTime();

    // apply the set of commands from the command line
    for ( var i = 0; i < Batch.commands.length; i++ ) {
        var cmds = Batch.commands[i];
        var sel  = Gui.parseSelected( cmds.selected );
        Batch.mesh.setSelectedFaces( sel );
        Batch.mesh.applyFilters( cmds );
    }

    // generate mesh
    var geometries = Batch.mesh.toBufferGeometry( {
        wireframe: true,
    } );

    // create and add main object
    Batch._model[0] = new THREE.Mesh( geometries[1], Scene.getDefaultMaterial() );

    // create and add face normals
    Batch._model[1] = new THREE.Line( geometries[2], Scene.getFaceNormalMaterial(), THREE.LinePieces );

    // // create and add vertex normals
    Batch._model[2] = new THREE.Line( geometries[3], Scene.getVertexNormalMaterial(), THREE.LinePieces );

    // // create and add wireframe geometry
    Batch._model[3] = new THREE.Line( geometries[4], Scene.getWireframeMaterial(), THREE.LinePieces );

    // // create and add selection
    Batch._model[4] = new THREE.Mesh( geometries[5], Scene.getSelectionMaterial() );

    // add models back
    for ( var i = 0 ; i < Batch._model.length ; ++i ) {
        Scene.addObject ( Batch._model[i] );
    }

    // update visuals
    Batch.refreshDisplaySettings();

    var end = new Date().getTime();
    var elapsed = end - start;

    console.log( "Mesh processing took " + elapsed + " ms" );
};

Batch.removeModel = function() {
    for ( var i = 0 ; i < Batch._model.length ; ++i ) {
        Scene._scene.remove( Batch._model[i] );
    }
}

Batch.meshChangeCallback = function( filename ) {
    Batch.removeModel();

    Batch.mesh = new Mesh();

    Batch.mesh.fromOBJ( filename, Batch.createModel );
};

// parse the command out of the url
Batch.parseUrl = function() {
    var url  = document.URL;
    var cmds = Parser.getCommands(url);

    Batch.obj = cmds[0].meshFile;
    if ( Batch.obj == undefined ) {
        Batch.obj = Gui.meshList[0]; // defaut to cube
    }
    Batch.commands = Parser.parseCommands(cmds);
}

Batch.refreshDisplaySettings = function() {

    if ( Batch.displayOptions.showGrid ) {
        Scene.showGrid();
    } else {
        Scene.hideGrid();
    }

    if ( Batch.displayOptions.showAxes ){
        Scene.showAxes();
    } else {
        Scene.hideAxis();
    }

    Scene.changeColor( Gui.displayOptions.meshColor );

    if ( Batch.displayOptions.showVC ) {
        Scene.showVertexColors();
    } else {
        Scene.hideVertexColors();
    }
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    //disable selection
    Gui.selection_possible = false;

    Scene.create();
    Renderer.create( Scene, document.getElementById("canvas") );

    Batch.parseUrl();

    // load new mesh
    Batch.meshChangeCallback( Batch.obj );

    Renderer.update();
};
