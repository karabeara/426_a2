"use strict";

// this construction helps avoid polluting the global name space
var Main = Main || {
  mesh : undefined,
  models : {},
  textSprites : {},

  baseMeshes: {},

  // internal stuff
  meshStack: [],
  batchMode: false,

  // print out debug info, namely filter processing time
  debugPrint: true, 

  // time in ms after which to pause filter application to update display
  // (can only pause between filters)
  applyRefreshTime: 66.66,

  // time in ms before "working..." popup is displayed 
  workingDialogDelay: 500,

  displaySettings: {
    showIdLabels   : true,
    wireframe      : true,
    shading        : "flat", // "flat" or "smooth"
    showVN         : false,
    showFN         : false,
    showVertDots   : false,
    showGrid       : true,
    showAxes       : true,
    
    meshColor      : "#85bb6a", //#66cc33",
    showVC         : false,    
  },
};

Main.createModel = function() {
  var start = new Date().getTime();

  // generate THREE.js geometries and processed mesh
  var processedMeshData = Main.mesh.toBufferGeometry();
  var geometries = processedMeshData.geometries;

  Main.models = {
    main:             new THREE.Mesh( geometries.main, Scene.getMaterial("main") ),
    faceNormals:      new THREE.Line( geometries.faceNormals, Scene.getMaterial("faceNormals"), THREE.LinePieces ),
    vertexNormals:    new THREE.Line( geometries.vertexNormals, Scene.getMaterial("vertexNormals"), THREE.LinePieces ),
    wireframe:        new THREE.Line( geometries.wireframe, Scene.getMaterial("wireframe"), THREE.LinePieces ),
    selectedFaces:    new THREE.Mesh( geometries.selectedFaces, Scene.getMaterial("selectedFaces") ),
    vertices:         new THREE.PointCloud( geometries.vertices, Scene.getMaterial("vertices") ),
    selectedVertices: new THREE.PointCloud( geometries.selectedVertices, Scene.getMaterial("selectedVertices") ),
    structureVisualization: new THREE.Line( geometries.structureVisualization, Scene.getMaterial("structureVisualization"), THREE.LinePieces ),
    edgeStructureVisualization: new THREE.Line( geometries.edgeStructureVisualization, Scene.getMaterial("edgeStructureVisualization"), THREE.LinePieces ),
  };

  for ( var modelName in Main.models ) {
    Scene.models[modelName] = Scene.addObject ( Main.models[modelName], modelName );
  }

  Main.textSprites = processedMeshData.textSprites;
  for (var i = 0; i < processedMeshData.textSprites.length; i++) {
    Scene.addIdLabel(processedMeshData.textSprites[i]);
  }

  Main.refreshDisplaySettings();

  var end = new Date().getTime();
  var elapsed = end - start;
  console.log( "Mesh processing took " + elapsed + " ms" );
};

Main.removeModel = function() {
  for ( var modelName in Main.models ) {
    Scene._scene.remove( Main.models[modelName] );
  }
  Scene.clearIdLabels();
};

Main.refreshModel = function() {
  Main.mesh = Main.meshStack[Main.meshStack.length - 1];
  Main.removeModel();
  Main.createModel();
  Main.refreshDisplaySettings();
};

Main.updateSelection = function(selectedVertices, selectedFaces) {

  if (Gui.hidden) return;

  var filterInsts = Gui.getFilterHistoryData();
  var selectionFilter;
  if (filterInsts.length > 0) {
    var topFilter = filterInsts[filterInsts.length - 1];
    if (topFilter.filterDef.name == "Selection") {
      selectionFilter = topFilter;
    }
  }
  if (!selectionFilter) {
    selectionFilter = Gui.addHistoryEntry(Gui.getFilterDef("Selection"))
  }

  var vertsStr = "";
  for (var i = 0; i < selectedVertices.length; i++) {
    vertsStr += selectedVertices[i];
    if (i < selectedVertices.length -1) {
      vertsStr += ",";
    }
  }
  var facesStr = "";
  for (var i = 0; i < selectedFaces.length; i++) {
    facesStr += selectedFaces[i];
    if (i < selectedFaces.length -1) {
      facesStr += ",";
    }
  }

  // these sets will trigger display update
  var vertsTextBox = selectionFilter.guiControls[0];
  var facesTextBox = selectionFilter.guiControls[1];
  vertsTextBox.setValue(vertsStr);
  facesTextBox.setValue(facesStr);
}

Main.refreshDisplaySettings = function() {
  if ( Main.displaySettings.showVertDots ) {
    Scene.showVertDots();
  } else {
    Scene.hideVertDots();
  }

  if ( Main.displaySettings.showGrid ) {
    Scene.showGrid();
  } else {
    Scene.hideGrid();
  }

  if ( Main.displaySettings.showIdLabels ) {
    Scene.showIdLabels();
  } else {
    Scene.hideIdLabels();
  }

  if ( Main.displaySettings.showAxes ){
    Scene.showAxes();
  } else {
    Scene.hideAxis();
  }

  Scene.changeColor( Main.displaySettings.meshColor );

  if ( Main.displaySettings.showVC ) {
    Scene.showVertexColors();
  } else {
    Scene.hideVertexColors();
  }
};

// called when the gui params change and we need to update the image
Main.controlsChangeCallback = function() {
  Main.filterHistoryData = Gui.getFilterHistoryData();

  Main.totalApplyTimeSinceFirstFilter = 0;
  Main.applyFilters();
};

Main.loadMesh = function(meshName) {
  var meshObj = new Mesh();
  
  // generate a callback closure
  var onLoadedCallback = function(meshName, meshObj) { 
    return function() {
      Main.meshesToLoad--;
      Main.baseMeshes[meshName] = meshObj;

      Main.controlsChangeCallback();
    };
  }(meshName, meshObj);

  meshObj.fromOBJ(meshName, onLoadedCallback);
}

// when HTML is finished loading, do this
window.onload = function() {
  Main.canvas = document.createElement('canvas');
  // Main.canvas = document.getElementById('canvas');
  Main.ctx    = canvas.getContext('2d');
  
  // get rid of the scrollbars
  document.documentElement.style.overflow = 'hidden';  // firefox, chrome
  document.body.scroll = "no"; // ie

  Main.gifEncoder = new GIFEncoder();
  Main.gifEncoder.setRepeat(0);
  //Main.gifEncoder.setQuality(20);
  Main.gifEncoder.setDelay(0.05);
  Main.gifEncoder.start();
  
  Main.gifFrames = [];

  // set student info into main window
  Student.updateHTML();

  // set up scene and renderer
  Scene.create();
  Renderer.create( Scene, Main.canvas );

  // initialize the gui with callbacks to handle gui changes
  Gui.init(Main.controlsChangeCallback);

  // TODO where to actually call this?
  Renderer.update();
};

// from http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
// modified to check correctly if colors are equal
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) {
    return false;
  }
  if (a.length != b.length) {
    return false;
  }

  var tf;
  for (var i = 0; i < a.length; ++i) {
    if (typeof Pixel != "undefined" && Pixel.prototype.isPrototypeOf(a) && Pixel.prototype.isPrototypeOf(b)) {
      if (! (a.data[0] === b.data[0] && a.data[1] === b.data[1] && a.data[2] === b.data[2] && a.a === b.a) ) {
        return false;
      }
    }
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

Main.applyFilters = function() {
  clearTimeout(Main.applyTimeout);
  Main.applyTimeout = null;

  var filterHistoryData = Main.filterHistoryData;

  Main.applicationCache = Main.applicationCache || [];
  var cache = Main.applicationCache;

  var imageNum = 0;

  var meshStack = [];
  Main.meshStack = meshStack;

  var totalFilterTime = 0;

  for (var i = 0; i < filterHistoryData.length; i++) {
    var data = filterHistoryData[i];

    if (data !== undefined) {
      var filterName = data.filterDef.name;

      // display "working..." dialog if it's been some time since apply start
      if (Main.totalApplyTimeSinceFirstFilter > Main.workingDialogDelay) {
        Gui.alertOnce("Working... (" + filterName + ")");
      }

      var args = data.argsList.slice();

      var cachedImageData = cache[i];

      if (data.filterDef.notFilter) { // APPLY NON-FILTER ACTION
        if (data.filterDef.baseMesh) {
          var baseMesh, meshName;

          if (filterName === "Base Mesh") {
            
            meshName = data.argsList[0];

            baseMesh = Main.baseMeshes[meshName];
            if (baseMesh) {
              if (Main.debugPrint) {
                // only print this here to avoid double print on mesh load
                console.log("-------\nBEGINNING FILTER APPLICATION\n------");
              }
              var baseMeshCopy = new Mesh();
              baseMeshCopy.copy(baseMesh);
            }
            else {
              // loadMesh will try filter application again when it finishes
              Main.loadMesh(meshName);
              return;
            }
          }

          // clear cache on image change
          if (cache[i] && cache[i].meshName !== meshName) {
            cache.splice(i+1, cache.length - (i+1));            
          }

          cache[i] = {
            meshName: meshName,
            lastFilterName: filterName,
            args: data.argsList.slice(),
          };
          meshStack.push(baseMeshCopy);
        }
      }
      else { // APPLY FILTER
        // use cache?
        if (cachedImageData !== undefined
          && cachedImageData.lastFilterName === filterName
          && arraysEqual(args, cachedImageData.args)) {

          for (var j = 0; j < (data.filterDef.numMeshInputs || 1); j++) {
            meshStack.pop();
          }
          var meshCopy = new Mesh();
          meshCopy.copy(cache[i].mesh);
          meshStack.push(meshCopy);

          if (Main.debugPrint) {
            console.log(filterName + ' operation (' + (i+1) + ') loaded from cache.');
          }
        }

        // cache invalid from here onward
        else {
          cache.splice(i+1, cache.length - (i+1));

          var argsNoImages = args.slice(); // need to save this for cache

          var meshCopyToFilter = new Mesh();
          for (var j = 0; j < (data.filterDef.numMeshInputs || 1); j++) {
            var popped = meshStack.pop();
            if (!popped) {
              console.log("ERROR: stack empty. History must start with base mesh");
              break;
            }
            meshCopyToFilter.copy(popped);
            args.unshift(meshCopyToFilter);
          }

          var filterFuncName = data.filterDef.funcName || filterName.toLowerCase();
          var filterFunc = Filters[filterFuncName];

          assert(filterFunc, "ERROR: filter not found: " + filterFuncName + ". Make sure the name in gui.js corresponds to the function name in filters.js.");

          var filterStartTime = performance.now();

          // call the function with the values in args as arguments
          filterFunc.apply(Filters, args);
          meshStack.push(meshCopyToFilter);

          var filterTime = Math.round( performance.now() - filterStartTime );
          if (Main.debugPrint) {
            console.log(filterName + ' operation (' + (i+1) + ') took ' + filterTime + ' ms.');
          }

          totalFilterTime += filterTime;
          Main.totalApplyTimeSinceFirstFilter += filterTime;

          var cachedMeshCopy = new Mesh();
          cachedMeshCopy.copy(meshCopyToFilter);

          cache[i] = {
            lastFilterName: filterName,
            args: argsNoImages,
            mesh: cachedMeshCopy,
          };
        }
      }

      // taking too long? halt the application to update the display, then immediately resume 
      if (totalFilterTime > Main.applyRefreshTime) {
        clearTimeout(Main.applyTimeout);
        Main.applyTimeout = setTimeout( Main.applyFilters, 0 );
        Main.refreshModel();
        return;
      }
    }
  }

  // only reach here when final filter application completes

  clearTimeout(Main.applyTimeout);
  // Gui.closeAlert();
  
  Main.refreshModel();

  if (Main.animatedValData) {
    Main.gifEncoder.addFrame( Main.canvas.getContext( '2d' ) );

    Main.animatedValData.current += Main.animatedValData.step;

    // encode+display gif
    if (Main.animatedValData.current >= Main.animatedValData.end) {
      Main.gifEncoder.finish();
      var binaryGif = Main.gifEncoder.stream().getData();
      var urlGif = 'data:image/gif;base64,' + encode64( binaryGif );
      var resGif = document.createElement( 'img' );
      resGif.src = urlGif;

      document.getElementById( 'canvas_div' ).style.display = "none"; 

      var container = document.getElementById( 'result_div' ); 
      container.appendChild( resGif );
    }
    else {
      Main.animatedValData.changeFunc(Main.animatedValData.current);
    }
  }
};