var Filters = Filters || {}

//Space for your helper functions
// ----------- STUDENT CODE BEGIN ------------
// ----------- Our reference solution uses 50 lines of code.
// ----------- STUDENT CODE END ------------


Filters.translation = function( mesh, x, y, z ) {
    var t = new THREE.Vector3(x, y, z);

    var verts = mesh.getModifiableVertices();

    var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
        verts[i].position.add( t );
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

// rotation: a Vector3 containing the desired rotation around each axis, in radians
Filters.rotation = function( mesh, x, y, z ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 12 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Rotation is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.scale = function( mesh, s ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 4 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Scaling is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.curvature = function ( mesh ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 82 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Curvature is not implemented yet');
}

Filters.noise = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 40 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Noise is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.smooth = function ( mesh, iter ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 39 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Smooth is not implemented yet');
    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.sharpen = function ( mesh, iter ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 40 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Sharpen is not implemented yet');
    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.bilateral = function ( mesh, iter ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 1 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('BilateralSmooth is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.inflate = function (  mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 16 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Inflate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.twist = function (  mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 8 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Twist is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.wacky = function ( mesh, factor ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 13 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Wacky is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.triangulate = function ( mesh ) {

    var faces = mesh.getModifiableFaces();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 4 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('triangulate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

// wrapper for splitEdgeMakeVert in mesh.js
Filters.splitEdge = function ( mesh ) {

    var verts = mesh.getSelectedVertices();

    if (verts.length === 2) {
        mesh.splitEdgeMakeVert(verts[0], verts[1], 0.5);
    }
    else {
        console.log("ERROR: to use split edge, select exactly 2 adjacent vertices");
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

// wrapper for joinEdgeKillVert in mesh.js
Filters.joinEdges = function ( mesh ) {

    var verts = mesh.getSelectedVertices();

    if (verts.length === 3) {
        var v0 = verts[0], 
            v1 = verts[1],
            v2 = verts[2];

        var he01 = mesh.edgeBetweenVertices(v0, v1);
        var he12 = mesh.edgeBetweenVertices(v1, v2);

        if (he01) {
            if (he12) {
                mesh.joinEdgeKillVert(verts[0], verts[1], verts[2]);
            }
            else {
                mesh.joinEdgeKillVert(verts[1], verts[0], verts[2]);
            }
        }
        else {
            if (he12) {
                mesh.joinEdgeKillVert(verts[0], verts[2], verts[1]);
            }
            else {
                console.log("ERROR: to use join edge, select exactly 3 vertices such that one only has edges to the other two")
            }
        }
    }
    else {
        console.log("ERROR: to use join edge, select exactly 3 vertices");
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

// wrapper for splitFaceMakeEdge in mesh.js
Filters.splitFace = function ( mesh ) {

    var verts = mesh.getSelectedVertices();
    var faces = mesh.getModifiableFaces();

    if (verts.length === 2 && faces.length === 1) {
        mesh.splitFaceMakeEdge(faces[0], verts[0], verts[1]);
    }
    else {
        console.log("ERROR: to use split face, select exactly 1 face and 2 nonadjacent vertices on it");
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

// wrapper for joinFaceKillEdge in mesh.js
Filters.joinFaces = function ( mesh ) {

    var verts = mesh.getSelectedVertices();
    var faces = mesh.getModifiableFaces();

    if (verts.length === 2 && faces.length === 2) {
        mesh.joinFaceKillEdge(faces[0], faces[1], verts[0], verts[1]);
    }
    else {
        console.log("ERROR: to use split face, select exactly 2 adjacent faces the 2 vertices between them");
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.extrude = function ( mesh, factor ) {

    var faces = mesh.getModifiableFaces();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 32 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Extrude is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.truncate = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 54 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Truncate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.bevel = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 104 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Bevel is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.splitLong = function ( mesh, factor  ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 35 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Split Long Edges is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.triSubdiv = function ( mesh, levels ) {
    Filters.triangulate( mesh );

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- Our reference solution uses 42 lines of code.
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Triangle subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.loop = function ( mesh, levels ) {
    Filters.triangulate( mesh );

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- Our reference solution uses 116 lines of code.
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Triangle subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.quadSubdiv = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- Our reference solution uses 53 lines of code.
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Quad subdivide is not implemented yet');        
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.catmullClark = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.faces;
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- Our reference solution uses 101 lines of code.
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Catmull-Clark subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.parseSelected = function(sel) {
    if (sel === undefined || sel.replace === undefined) return [];
    if (typeof sel === "number") {
        return [sel];
    }
    // sel = sel.replace(/[\(\)]/g,'');
    sel = sel.split(',');
    var parsedSel = [];
    for (var i = 0; i < sel.length; i++) {
        var idx = parseInt(sel[i]);
        if (!isNaN(idx)) {
            parsedSel.push(idx);
        }
    }
    return parsedSel;
}

// internal filter for updating selection
Filters.selection = function( mesh, vertIdxs, faceIdxs ) {
    mesh.setSelectedVertices(Filters.parseSelected(vertIdxs));
    mesh.setSelectedFaces(Filters.parseSelected(faceIdxs));
};

// internal filter for setting display settings
Filters.displaySettings = function( mesh, showLabels, showHalfedge, shading, showVN, showFN, showGrid, showVertDots, showAxes, showVC, meshColor ) {

    Main.displaySettings.showIdLabels = showLabels;
    Main.displaySettings.wireframe = showHalfedge;
    Main.displaySettings.shading = shading;
    Main.displaySettings.showVN = showVN;
    Main.displaySettings.showFN = showFN;
    Main.displaySettings.showGrid = showGrid;
    Main.displaySettings.showVertDots = showVertDots;

    Main.displaySettings.showAxes = showAxes;
    Main.displaySettings.showVC = showVC;
    // Main.displaySettings.meshColor = meshColor;

    // Main.refreshDisplaySettings();
};
