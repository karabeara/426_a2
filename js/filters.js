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
    var verts = mesh.getModifiableVertices();

    var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) { //x rotation
		var vx = verts[i].position.getComponent(0);
		var vy = verts[i].position.getComponent(1);
		var vz = verts[i].position.getComponent(2);
		var t_x = new THREE.Vector3(vx, Math.cos(x)*vy-Math.sin(x)*vz, Math.sin(x)*vy+Math.cos(x)*vz);
        verts[i].position = t_x;
    }
	for ( var i = 0 ; i < n_vertices ; ++i ) { //y rotation
		var vx = verts[i].position.getComponent(0);
		var vy = verts[i].position.getComponent(1);
		var vz = verts[i].position.getComponent(2);
		var t_y = new THREE.Vector3(Math.cos(y)*vx+Math.sin(y)*vz, vy, -Math.sin(y)*vx+Math.cos(y)*vz);
        verts[i].position = t_y;
    }
	for ( var i = 0 ; i < n_vertices ; ++i ) { //z rotation
		var vx = verts[i].position.getComponent(0);
		var vy = verts[i].position.getComponent(1);
		var vz = verts[i].position.getComponent(2);
		var t_z = new THREE.Vector3(Math.cos(z)*vx-Math.sin(z)*vy, Math.sin(z)*vx+Math.cos(z)*vy, vz);
        verts[i].position = t_z;
    }
	
		
	
    // ----------- STUDENT CODE END ------------

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.scale = function( mesh, s ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 4 lines of code.
    var t = new THREE.Vector3(s, s, s);

    var verts = mesh.getModifiableVertices();

    var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
        verts[i].position.multiply(t);
    }

    // ----------- STUDENT CODE END ------------
    //Gui.alertOnce ('Scaling is not implemented yet');

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
	var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
		var avg_len = mesh.averageEdgeLength(verts[i]);
		t = verts[i].normal.multiplyScalar(Math.random()*factor*avg_len);
        verts[i].position.add(t);
    }
    // ----------- STUDENT CODE END ------------

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.smooth = function ( mesh, iter ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 39 lines of code.
	for (var it = 0; it < iter; ++it) {
		var oldMesh = new Mesh();
		oldMesh.copy(mesh);
		var oldVerts =  mesh.getModifiableVertices();
		var n_vertices = verts.length;
		for ( var i = 0 ; i < n_vertices ; ++i ) {
			var sigma = oldMesh.averageEdgeLength(oldVerts[i]);
			var sum = new THREE.Vector3(oldVerts[i].position.x, oldVerts[i].position.y, oldVerts[i].position.z);
			var weight_sum = 1;
			var vs = oldMesh.verticesOnVertex(oldVerts[i]);
			for (var j = 0; j < vs.length; ++j) {
				var l = oldMesh.dist(vs[j].position, oldVerts[i].position)
				var w = Math.exp(-l*l/(2*sigma*sigma));
				weight_sum = weight_sum + w;
				var temp = new THREE.Vector3(vs[j].position.x, vs[j].position.y, vs[j].position.z);
				temp.multiplyScalar(w);
				sum.add(temp);
			}
			verts[i].position = sum.divideScalar(weight_sum);
		}
	}
    // ----------- STUDENT CODE END ------------
    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.sharpen = function ( mesh, iter ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 40 lines of code
	var smoothMesh = new Mesh();
	smoothMesh.copy(mesh);
	Filters.smooth(smoothMesh, iter);
	var smoothVerts = smoothMesh.getModifiableVertices();
	
	var n_vertices = verts.length;
	for ( var i = 0 ; i < n_vertices ; ++i ) {
		var diff = (new THREE.Vector3(verts[i].position.x, verts[i].position.y, verts[i].position.z)).sub(smoothVerts[i].position);
		verts[i].position.add(diff);
	}
    // ----------- STUDENT CODE END ------------
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
	var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
		var avg_len = mesh.averageEdgeLength(verts[i]);
		var temp = new THREE.Vector3(verts[i].normal.x, verts[i].normal.y, verts[i].normal.z)
		temp.multiplyScalar(factor*avg_len);
        verts[i].position.add(temp);
    }
    // ----------- STUDENT CODE END ------------

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.twist = function (  mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 8 lines of code.

    var verts = mesh.getModifiableVertices();

    var n_vertices = verts.length;
	for ( var i = 0 ; i < n_vertices ; ++i ) { //y rotation
		var vx = verts[i].position.getComponent(0);
		var vy = verts[i].position.getComponent(1);
		var vz = verts[i].position.getComponent(2);
		var rot = vy*factor;
		var t_y = new THREE.Vector3(Math.cos(rot)*vx+Math.sin(rot)*vz, vy, -Math.sin(rot)*vx+Math.cos(rot)*vz);
        verts[i].position = t_y;
    }
	
    // ----------- STUDENT CODE END ------------

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
    var n_faces = faces.length;
    for ( var i = 0 ; i < n_faces ; i++ ) { 
        mesh.triangulateFace(faces[i]);
    }
    // ----------- Our reference solution uses 4 lines of code.
    // ----------- STUDENT CODE END ------------
    //Gui.alertOnce ('triangulate is not implemented yet');

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
	var n_faces = faces.length;
	for ( var i = 0 ; i < n_faces ; ++i ) {
		
		var old_verts = mesh.verticesOnFace(faces[i]);
		var old_edges = []
		var new_verts = []
		for (var v_i = 0; v_i < old_verts.length; v_i++) { //make new verts
			new_verts[v_i] = mesh.splitEdgeMakeVert(old_verts[v_i], old_verts[(v_i+1)%old_verts.length], 0);
			old_edges[v_i] = mesh.edgeBetweenVertices(new_verts[v_i], old_verts[(v_i+1)%old_verts.length]);
		}
		for (var v_i = 0; v_i < old_verts.length; v_i++) { //split other faces once
			faces_i = mesh.facesOnVertex(old_verts[v_i]);
			faces_i_1 = mesh.facesOnVertex(old_verts[(v_i+1)%old_verts.length]);
			var common_face = undefined;
			for (var f_i = 0; f_i < faces_i.length; f_i++) {
				if (faces_i[f_i] !== faces[i]) {
					for (var f_j = 0; f_j < faces_i_1.length; f_j++) {
						if (faces_i[f_i] === faces_i_1[f_j])
							common_face = faces_i[f_i];
					}
				}
			}
			mesh.splitFaceMakeEdge(common_face, old_verts[v_i], old_verts[(v_i+1)%old_verts.length], new_verts[v_i], false); //wrong face to split?
		}
		for (var v_i = 0; v_i < new_verts.length; v_i++) { //split new face
			mesh.splitFaceMakeEdge(faces[i], new_verts[v_i], new_verts[(v_i+1)%new_verts.length], new_verts[(v_i+2)%new_verts.length], false);
		}
		for (var v_i = 0; v_i < new_verts.length; v_i++) { //join faces
			mesh.joinFaceKillEdgeSimple(old_edges[v_i]);
		}
		for (var v_i = 0; v_i < new_verts.length; v_i++) {
			var dir = new THREE.Vector3(faces[i].normal.x, faces[i].normal.y, faces[i].normal.z);
			new_verts[v_i].position.add(dir.multiplyScalar(factor));
		}
	}
	
    // ----------- STUDENT CODE END -----------

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.truncate = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // Need to add two new vertices, and a single new face
    // Store respective 
    var n_verts  = verts.length
    //for (var i = 0; i < n_verts; i++) {
    i = 0
        var old_edges = mesh.edgesOnVertex(vert[i])
        var new_verts = []
        var new_edges = []

        for (var j = 0; j < old_edges.length - 1; j++) {  // make new verts
            new_verts[j] = mesh.splitEdgeMakeVert(verts[i], verts[i], 0);
        }
        var v1 = verts[i]
        var v2 = mesh.addVertex(v1.position)
        var v3 = mesh.addVertex(v1.position)

        var f = mesh.addFace()
        console.log(v1)
        console.log(v2)
        console.log(v3)
        console.log(f)



/*
        // add (n-1) vertices per vertex
        var edges = mesh.edgesOnVertex(v1)
        for (var j = 0; j < edges.length; j++) {
            var v2 = mesh.addVertex(v1.position)
            verts[index++] = v2
        }
        // add 1 face per vertex
        var f = mesh.addFace()
        f.normal = v1.normal
        f.halfedge = v1.halfedge
*/
    //}

    // Move Vertices along halfedges
    // Store respective offset vectors per vertex beforehand
    /*
    for (var i = 0; i < orig_vert_len; i++) {
        
        var v1 = verts[i]
        // add (n-1) vertices per vertex
        var edges = mesh.edgesOnVertex(v1)
        for (var j = 0; j < edges.length; j++) {
            var v2 = mesh.addVertex(v1.position)
            verts[index++] = v2
        }
        // add 1 face per vertex
        var f = mesh.addFace()
    }
    */
    // ----------- Our reference solution uses 54 lines of code.
    // ----------- STUDENT CODE END ------------
    //Gui.alertOnce ('Truncate is not implemented yet');

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
        var n_faces = faces.length
        console.log(n_faces)
        // Copy initial mesh
        var oldMesh = new Mesh();
        oldMesh.copy(mesh);

        // Create list of half edges
        var old_verts = [];
        var i_vert = 0;

        for ( var i = 0; i < n_faces; i++ ) {
            var vertices = mesh.verticesOnFace( faces[i] )
            for ( var j = 0; j < 3; ++j ) { old_verts[i_vert] = vertices[j]; i_vert += 1; }
        }

        var i_old = 0
        var i_new = 0
        var new_verts = [];

        for ( var i = 0; i < n_faces; i ++) {
            var verts = []
            
            for ( var j = 0; j < 3; j++ ) { verts[j] = old_verts[i_old]; i_old += 1 }

            var v1 = verts[0]
            var v2 = verts[1]
            var v3 = verts[2]

            // Split halfedges in half as well as their opposites
            // Still a bug in determining the already calculated vertex!!!!!!!
            var v4, v5, v6;
            var he1 = mesh.edgeBetweenVertices( v1, v2 );
            if (!he1) { } else { v4 = mesh.splitEdgeMakeVert(v1, v2, 0.5) }
            var he2 = mesh.edgeBetweenVertices( v1, v3 );
            if (!he2) { } else { v5 = mesh.splitEdgeMakeVert(v1, v3, 0.5) }
            var he3 = mesh.edgeBetweenVertices( v2, v3 );
            if (!he3) { } else { v6 = mesh.splitEdgeMakeVert(v2, v3, 0.5) }

            if (!he1) { v4 = mesh.vertBetweenVertices (v1,v2) } 
            if (!he2) { v5 = mesh.vertBetweenVertices (v1,v3) } 
            if (!he3) { v6 = mesh.vertBetweenVertices (v2,v3) } 

            new_verts[i_new++] = v4;
            new_verts[i_new++] = v5;
            new_verts[i_new++] = v6;   
        }

        var v_i = 0;

        for ( var i = 0; i < n_faces; i ++) {
            var verts = []
            
            for ( var j = 0; j < 3; j++ ) { verts[j] = new_verts[v_i]; v_i += 1 }

            var v4 = verts[0]
            var v5 = verts[1]
            var v6 = verts[2]

            // Join new vertices around a face
            // BUG WHEN VERTICES ARE ALREADY CALCULATED
            if (i != 9) {
                var f1 = mesh.splitFaceMakeEdge(faces[i], v4, v5, v6, true)
                //faces[i].halfedge = v4.halfedge.opposite
                var f2 = mesh.splitFaceMakeEdge(f1, v4, v6, v5, true)
                var f3 = mesh.splitFaceMakeEdge(f2, v5, v6, v4, true) 
            } else {
                //f1 = "hello"
                //f1 = mesh.splitFaceMakeEdge(faces[i], v4, v5, v6, true)
                //var f3 = mesh.splitFaceMakeEdge(f2, v4, v6, v5, true) 
            }
        }
        // ----------- Our reference solution uses 42 lines of code.
        // ----------- STUDENT CODE END ------------
        //Gui.alertOnce ('Triangle subdivide is not implemented yet');
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
