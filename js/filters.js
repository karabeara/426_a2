var Filters = Filters || {}

//Space for your helper functions
// ----------- STUDENT CODE BEGIN ------------
// ----------- Our reference solution uses 50 lines of code.

//from assignment 1 (Same partners)
Filters.histogramEqualizationFilter = function( values ) {
  // ----------- STUDENT CODE BEGIN ------------

  var bins = new Array(256);
  for (var i = 0; i < 256; i+=1) {
    bins[i] = 0;
  }
  var minLum, imageSize;
  for (var x = 0; x < values.length; x++) {
      var luminance = Math.round(values[x]*255);
      bins[luminance] = bins[luminance] + 1;
  }

  minLum = 0;
  for (var i = 1; i < 256; i+=1) {
    if (bins[i] != 0) { minLum = i; break; }
  }

  for (var i = 1; i < 256; i+=1) {
    bins[i] = bins[i] + bins [i-1];
  }

  for (var x = 0; x < values.length; x += 1) {
      var lum = Math.round(values[x]*255);
      values[x] = (bins[lum] - bins[minLum]) / (values.length - 1);
  }

  return values;
};
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
	var verts = mesh.getModifiableVertices();
	var sumAngles = []
	
	for (var i = 0; i < verts.length; i++) {
		other_verts = mesh.verticesOnVertex(verts[i]);
		sumAngles[i] = 0;
		for (var j = 0; j < other_verts.length; j++) {
			var A = other_verts[j].position;
			var B = verts[i].position;
			var C = other_verts[(j+1)%other_verts.length].position;
			var e1 = new THREE.Vector3(A.x - B.x, A.y - B.y, A.z - B.z);
			e1.normalize();
			var e2 = new THREE.Vector3(C.x - B.x, C.y - B.y, C.z - B.z);
			e2.normalize();
			var angle = Math.acos(e1.dot(e2));
			sumAngles[i] += angle;
		}
		sumAngles[i] = 2*3.14159 - sumAngles[i];
	}
	
	var minSum = sumAngles[0];
	var maxSum = sumAngles[0];
	for (var i = 0; i < verts.length; i++) {
		if (sumAngles[i] > maxSum) maxSum = sumAngles[i];
		if (sumAngles[i] < minSum) minSum = sumAngles[i];
	}
	
	var curvs = []
	for (var i = 0; i < verts.length; i++) {
		verts[i].curvature = sumAngles[i];
		curvs[i] = (sumAngles[i]-minSum)/(maxSum-minSum);
	}
	curvs = Filters.histogramEqualizationFilter(curvs);
	for (var i = 0; i < verts.length; i++) {
		verts[i].color = new THREE.Vector3(curvs[i], curvs[i], curvs[i]);
	}
	
	
	
    // ----------- STUDENT CODE END ------------
}

Filters.noise = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 40 lines of code.
	var origMesh = new Mesh();
	origMesh.copy(mesh);
	var origVerts = origMesh.getModifiableVertices();
	
	var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
		var avg_len = origMesh.averageEdgeLength(origVerts[i]);
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
	var origMesh = new Mesh();
	origMesh.copy(mesh);
	var origVerts = origMesh.getModifiableVertices();
	
	var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
		var avg_len = origMesh.averageEdgeLength(origVerts[i]);
		var temp = new THREE.Vector3(origVerts[i].normal.x, origVerts[i].normal.y, origVerts[i].normal.z)
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
	var verts = mesh.getModifiableVertices();
	var origMesh = new Mesh();
	origMesh.copy(mesh);
	var origVerts = origMesh.getModifiableVertices();
	
	var n_vertices = verts.length;
	
	var max_height = verts[0].position.y;
	var min_height = verts[0].position.y;
	for ( var i = 0 ; i < n_vertices ; ++i ) {
		if (verts[i].position.y > max_height) {
			max_height = verts[i].position.y;
		}
		if (verts[i].position.y < min_height) {
			min_height = verts[i].position.y;
		}
	}
	var h = max_height - min_height;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
		var avg_len = origMesh.averageEdgeLength(origVerts[i]);
		var temp = new THREE.Vector3(h/2*Math.sin((verts[i].position.y/h)*3.14159/factor), 0, 0)
	//	var temp = new THREE.Vector3(Math.sin(verts[i].position.y/h), 0, 0)
        verts[i].position.add(temp);
    }
    // ----------- STUDENT CODE END ------------

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

  //  var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------

	origMesh = new Mesh();
	origMesh.copy(mesh);
	var orig_verts = origMesh.getModifiableVertices();
	var verts = mesh.getModifiableVertices();
	var n_verts = verts.length;
	for ( var i = 0 ; i < n_verts ; ++i ) {

		//make new verts
		var otherVerts = mesh.verticesOnVertex(verts[i]);
		var newVerts = []
		for (var v_i = 0; v_i < otherVerts.length-1; ++v_i) {
			newVerts[v_i] = mesh.splitEdgeMakeVert(verts[i], otherVerts[v_i], factor);
		}
			
		//make new face
		for (var v_i = 0; v_i < newVerts.length-1; v_i++) {
			faces_a = mesh.facesOnVertex(newVerts[v_i]);
			faces_b = mesh.facesOnVertex(newVerts[(v_i+1)%newVerts.length]);
			var common_face = undefined;
			for (var f_i = 0; f_i < faces_a.length; f_i++) {
				for (var f_j = 0; f_j < faces_b.length; f_j++) {
					if (faces_a[f_i] === faces_b[f_j])
						common_face = faces_a[f_i];
				}
			}
			mesh.splitFaceMakeEdge(common_face, newVerts[v_i], newVerts[(v_i+1)%newVerts.length]);
			
			if (v_i > 0) { //only make one new face
				var edge = mesh.edgeBetweenVertices(newVerts[v_i], verts[i]);
				mesh.joinFaceKillEdgeSimple(edge);
			}
		}
		

		//move to correct spot base on origMesh
		origOtherVerts = origMesh.verticesOnVertex(orig_verts[i]);
		for (var v_i = 0; v_i < newVerts.length; v_i++) {
			var new_pos = new THREE.Vector3( 0, 0, 0 );
			var p1 = new THREE.Vector3( 0, 0 ,0 );
			p1.copy( orig_verts[i].position );
			var p2 = new THREE.Vector3( 0, 0 ,0 );
			p2.copy( origOtherVerts[v_i].position );
			new_pos.add( p1.multiplyScalar( 1 - factor ) );
			new_pos.add( p2.multiplyScalar( factor ) );
			newVerts[v_i].position = new_pos;
		}
		
		
		//move the last vertex
		var new_pos = new THREE.Vector3( 0, 0, 0 );
		var p1 = new THREE.Vector3( 0, 0 ,0 );
		p1.copy( orig_verts[i].position );
		var p2 = new THREE.Vector3( 0, 0 ,0 );
		p2.copy( origOtherVerts[otherVerts.length-1].position );
		new_pos.add( p1.multiplyScalar( 1 - factor ) );
		new_pos.add( p2.multiplyScalar( factor ) );
		verts[i].position = new_pos;
		
	}
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
	var init_faces = mesh.getModifiableFaces();
	var init_edges = [];
	for (var f_i = 0; f_i < init_faces.length; f_i++) {
		var f_edges = mesh.edgesOnFace(init_faces[f_i]);
		for (var e_i = 0; e_i < f_edges.length; e_i++) {
			if(init_edges.indexOf(f_edges[e_i]) == -1) 
				init_edges.push(f_edges[e_i]);
		}
	}
	
	for (var iter = 0; iter < factor*init_edges.length; iter++) {
		var faces = mesh.getModifiableFaces();
		var edges = [];
		for (var f_i = 0; f_i < faces.length; f_i++) {
			var f_edges = mesh.edgesOnFace(faces[f_i]);
			for (var e_i = 0; e_i < f_edges.length; e_i++) {
				if(edges.indexOf(f_edges[e_i]) == -1) 
					edges.push(f_edges[e_i]);
			}
		}

		
		var longDist = 0;
		var longEdge = undefined;
		for (var e_i = 0; e_i < edges.length; e_i++) {
			var v1 = edges[e_i].vertex;
			var v2 = edges[e_i].opposite.vertex;
			var d = mesh.dist(v1.position, v2.position);
			if (d > longDist) {
				longDist = d;
				longEdge = edges[e_i];
			}
		}
		
		var vs = mesh.verticesOnFace(longEdge.face);
		var count = 0;
		var v = vs[count];
		while (true) {
			if (v !== longEdge.vertex && v !== longEdge.opposite.vertex)
				break;
			count++;
			v = vs[count];
		}
		
		var newVert = mesh.splitEdgeMakeVert(longEdge.vertex, longEdge.opposite.vertex, 0.5);
		mesh.splitFaceMakeEdge(longEdge.face, newVert, v);
	}
	
    // ----------- STUDENT CODE END ------------

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.triSubdiv = function ( mesh, levels ) {
    Filters.triangulate( mesh );
    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        var n_faces = faces.length
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
            var f1 = mesh.splitFaceMakeEdge(faces[i], v4, v6, v5, true)
            var f2 = mesh.splitFaceMakeEdge(f1, v4, v5, v6, true)
            var f3 = mesh.splitFaceMakeEdge(f2, v5, v6, v4, true) 

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
        var n_faces = faces.length
        
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

        var i_old = 0
        var i_new = 0
        var old_vert_weights_x = [];
        var old_vert_weights_y = [];
        var old_vert_weights_z = [];
        var new_vert_weights_x = [];
        var new_vert_weights_y = [];
        var new_vert_weights_z = [];

        // Calculate weights for even (old, original) vertices
        for ( var i = 0; i < old_verts.length; i ++) {
            var totalX = 0, totalY = 0, totalZ = 0, beta = 3./16
            var neighbors = mesh.verticesOnVertex( old_verts[i] )

            if (old_verts.length > 3) { beta = 3 / (8 * old_verts.length) }
            else                      { beta = 3 / 16 }

            for ( var j = 0; j < neighbors.length; j ++) {
                totalX += beta * neighbors[j].position.x
                totalY += beta * neighbors[j].position.y
                totalZ += beta * neighbors[j].position.z
            }
            var selfX = ( 1 - (old_verts.length * beta) ) * old_verts[i].position.x
            var selfY = ( 1 - (old_verts.length * beta) ) * old_verts[i].position.y
            var selfZ = ( 1 - (old_verts.length * beta) ) * old_verts[i].position.z
            
            old_vert_weights_x[i] = totalX + selfX
            old_vert_weights_y[i] = totalY + selfX
            old_vert_weights_z[i] = totalZ + selfX

            // console.log(old_vert_weights_x[i])
            // console.log(old_vert_weights_y[i])
            // console.log(old_vert_weights_z[i])
        }

        // Calculate weights for odd (new) vertices
        for ( var i = 0; i < new_verts.length; i++) {
            var totalX = 0, totalY = 0, totalZ = 0
            var neighbors = mesh.verticesOnVertex( new_verts[i] )
            console.log(neighbors)
            direct_beta = 3 / 8
            indirect_beta = 1 /8

            for ( var j = 0; j < 2; j++) {
                totalX += direct_beta * neighbors[j].position.x
                totalY += direct_beta * neighbors[j].position.y
                totalZ += direct_beta * neighbors[j].position.z
            }
 
            var opp1, opp2
            var twoFaces = []
            twoFaces = mesh.facesOnVertices(v1, v2)
            var face1 = twoFaces[0]
            var face2 = twoFaces[1]
            console.log(face1)
            console.log(face2)

            var verts_1 = mesh.verticesOnFace(face1)
            var index_1 = 0
            while ( true ) {
                if (verts_1[index_1] !== neighbors[0] && verts_1[index_1] !== neighbors[1]) { opp1 = verts_1[index_1]; }
                index_1 += 1
                if (index_1 > verts_1.length - 1) break;
            }

            var verts_2 = oldMesh.verticesOnFace(face2)
            var index_2 = 0
            while ( true ) {
                if (verts_2[index_2] !== neighbors[0] && verts_2[index_2] !== neighbors[1]) { opp2 = verts_2[index_2]; }
                index_2 += 1
                if (index_2 > verts_2.length - 1) break;
            }

            var otherX = indirect_beta * opp1.position.x + indirect_beta * opp2.position.x
            var otherY = indirect_beta * opp1.position.y + indirect_beta * opp2.position.y
            var otherZ = indirect_beta * opp1.position.z + indirect_beta * opp2.position.z
           
            new_vert_weights_x[i] = totalX + otherX
            new_vert_weights_y[i] = totalY + otherY
            new_vert_weights_z[i] = totalZ + otherZ

            console.log(new_vert_weights_x[i])
            console.log(new_vert_weights_y[i])
            console.log(new_vert_weights_z[i])
        }

        var v_i = 0;

        for ( var i = 0; i < n_faces; i ++) {
            var verts = []
            
            for ( var j = 0; j < 3; j++ ) { verts[j] = new_verts[v_i]; v_i += 1 }

            var v4 = verts[0]
            var v5 = verts[1]
            var v6 = verts[2]

            // Join new vertices around a face
            var f1 = mesh.splitFaceMakeEdge(faces[i], v4, v6, v5, true)
            var f2 = mesh.splitFaceMakeEdge(f1, v4, v5, v6, true)
            var f3 = mesh.splitFaceMakeEdge(f2, v5, v6, v4, true) 

        }


        // Reset positions for even (old, original) vertices according to precomputed weights
        for ( var i = 0; i < old_verts.length; i ++) {
            var x_ = old_vert_weights_x[i]
            var y_ = old_vert_weights_y[i]
            var z_ = old_vert_weights_z[i]
            var average = (x_ + y_ + z_) / 3
            t = old_verts[i].normal.multiplyScalar(average);
            old_verts[i].position.add(t);
            //var new_pos = new THREE.Vector3( x_, y_, z_ );
            //old_verts[i].position = new_pos;
        }

        // Reset positions for odd (new) vertices according to precomputed weights
        for ( var i = 0; i < new_verts.length; i ++) {
            var x_ = new_vert_weights_x[i]
            var y_ = new_vert_weights_y[i]
            var z_ = new_vert_weights_z[i]
            var average = (x_ + y_ + z_) / 3
            t = new_verts[i].normal.multiplyScalar(average);
            new_verts[i].position.add(t);
            // var new_pos = new THREE.Vector3( x_, y_, z_ );
            // new_verts[i].position = new_pos;
        }
        //----------- Our reference solution uses 116 lines of code.
        // ----------- STUDENT CODE END ------------
        //Gui.alertOnce ('Loop subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.quadSubdiv = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        var n_faces = faces.length

        // Copy initial mesh
        var oldMesh = new Mesh();
        oldMesh.copy(mesh);
        var old_faces = oldMesh.getModifiableFaces();

        var old_centroids = []
        for ( var i = 0; i < n_faces; i++ ) {
            old_centroids[i] = oldMesh.calculateFaceCentroid(old_faces[i])
        }

        var n_faces = faces.length

        // Create list of half edges
        var old_verts = [];
        var old_vert_nums = [];
        var midpoints = [];
        var midpoint_nums = [];
        var i_vert = 0;

        for ( var i = 0; i < n_faces; i++ ) {
            var old_i_vert = i_vert;
            var vertices = mesh.verticesOnFace( faces[i] )
            for ( var j = 0; j < vertices.length; ++j ) { old_verts[i_vert] = vertices[j]; i_vert += 1; }
            old_vert_nums[i] = i_vert - old_i_vert;
        }

        var i_old = 0
        i_mid = 0; 
        for ( var i = 0; i < n_faces; i ++) {
            var verts = []
            var n_verts = old_vert_nums[i]
            var old_i_mid = i_mid;
            for ( var j = 0; j < n_verts; j++ ) { verts[j] = old_verts[i_old]; i_old += 1 }

            for ( var k = 0; k < n_verts; k++) {
                var v1 = verts[ (k) % n_verts ]
                var v2 = verts[ (k+1) % n_verts ]
                var v3 = verts[ (k+2) % n_verts ]

                var v3;
                var he1 = mesh.edgeBetweenVertices( v1, v2 );
                if (!he1) { } else { v3 = mesh.splitEdgeMakeVert(v1, v2, 0.5) }
                if (!he1) { v3 = mesh.vertBetweenVertices_T (v1,v2,v3); }
                midpoints[i_mid++] = v3; 
            }
            midpoint_nums[i] = i_vert - old_i_vert;
        }

        var i_old = 0
        var i_center = 0
        var centers = [];

        for ( var i = 0; i < n_faces; i ++) {
            
            var verts = []
            var n_verts = midpoint_nums[i]
            
            for ( var j = 0; j < n_verts; j++ ) { verts[j] = midpoints[i_old]; i_old += 1 }

            var v1 = verts[0]
            var v2 = verts[1]
            var v3 = verts[2]

            var f  = mesh.splitFaceMakeEdge(faces[i], v1, v2, v3, true)
            var v4 = mesh.splitEdgeMakeVert(v1, v2, 0.5); 
            centers[i_center++] = v4;

            for ( var k = 2; k < n_verts; k++) {
                var v_new = verts[k]
                var v_other = verts[ (k+1) % n_verts ]
                f = mesh.splitFaceMakeEdge(f, v_new, v4, v_other, true); 
            }
        }

        for ( var i = 0; i < centers.length; i ++) {
            centers[i].position = old_centroids[i]
        }

        // ----------- Our reference solution uses 53 lines of code.
        // ----------- STUDENT CODE END ------------
        //Gui.alertOnce ('Quad subdivide is not implemented yet');        
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
