// Empty mesh constuctor
function Mesh() {
    this.clear();
}

// Vertex constuctor, only stores position
// Should not be used directly, vertices should be added via addVertex method or euler operators
function Vertex( x, y, z ) {
    this.id        = -1;
    this.position  = new THREE.Vector3( x, y, z );
    this.normal    = new THREE.Vector3();
    this.color     = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
    this.curvature = 0.0;
    this.selected = false;

    this.halfedge  = undefined;

    this.removed = undefined;
}

// Face Constuctor
// Should not be used directly, faces should be added via addFace method or euler operators
function Face() {
    this.id        = -1;
    this.normal    = new THREE.Vector3();
    this.area      = 0.0;
    this.centroid  = undefined;
    this.selected  = false;

    this.halfedge  = undefined;

    this.removed = undefined;
}

// HalfEdge Constuctor
// Should not be used directly, faces should be added via addFace method or euler operators
function HalfEdge() {
    this.id     = -1;
    this.selected = false;
    this.midpoint = undefined;

    this.vertex   = undefined;
    this.next     = undefined;
    this.opposite = undefined;
    this.face     = undefined;

    this.removed = undefined;
}

////////////////////////////////////////////////////////////////////////////////
// Data Structure Modification (lowest level level)
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.clear = function() {
    this.vertices   = [];
    this.halfedges  = [];
    this.faces      = [];
}

Mesh.prototype.copy = function( mesh ) {
    this.vertices  = [];
    this.faces     = [];
    this.halfedges = [];
    var v_id, f_id, he_id;

    assert(mesh, "Mesh.copy must take a mesh to copy from");

    // create list of vertices
    for ( v_id in mesh.vertices ) {
        var v_org = mesh.vertices[ v_id ];
        var v_cpy = this.addVertex( v_org.position );
        v_cpy.normal.copy( v_org.normal );
        v_cpy.color.copy( v_org.color );
        v_cpy.curvature = v_org.curvature;
        v_cpy.selected = v_org.selected;
    }

    // create list of faces
    for ( f_id in mesh.faces ) {
        var f_org = mesh.faces[f_id];
        var f_cpy = this.addFace();
        if ( f_org.normal !== undefined ) {
            f_cpy.normal = new THREE.Vector3( f_org.normal.x,
                                              f_org.normal.y,
                                              f_org.normal.z );
        }
        f_cpy.selected = f_org.selected;
    }

    // create all half edges
    for ( he_id in mesh.halfedges ) {
         var he_org = mesh.halfedges[ he_id ];
         var f_org  = he_org.face;
         var f_cpy  = this.faces[ f_org.id ];

         var he_cpy = this.addHalfEdge( this.vertices[ he_org.opposite.vertex.id ],
                                        this.vertices[ he_org.vertex.id ],
                                        f_cpy );
        he_cpy.selected = he_org.selected;
    }

    // relink halfedges
    for ( he_id in mesh.halfedges ) {
        var he_org = mesh.halfedges[ he_id ];
        var he_cpy = this.halfedges[ he_id ];
        he_cpy.next = this.halfedges[ he_org.next.id ];
        he_cpy.opposite = this.halfedges[ he_org.opposite.id ];
    }

    // add face reference to halfedges
    for ( f_id in mesh.faces ) {
        var f_org = mesh.faces[f_id];
        var f_cpy = this.faces[f_id];
        f_cpy.halfedge = this.halfedges[ f_org.halfedge.id ];
    }
};

Mesh.prototype.addVertex = function( position ) {
   var v = new Vertex( position.x, position.y, position.z );
   v.id = this.vertices.length;

   this.vertices.push( v );

   return v;
};

Mesh.prototype.addFace = function() {
    var f = new Face();
    f.id = this.faces.length;
    this.faces.push(f);
    f.halfedge = undefined;

   return f;
};

Mesh.prototype.addHalfEdge = function( origin, destination, face ) {
    var he = new HalfEdge();
    he.id = this.halfedges.length;
    this.halfedges.push (he);

    he.vertex = destination;
    he.face = face;
    origin.halfedge = he;

    he.next     = undefined;
    he.opposite = undefined;

    return he;
};

// TODO make removal less slow
Mesh.prototype.removeVertex = function( v ) {
    var idx = this.vertices.indexOf(v);
    if (idx > -1) {
        this.vertices.splice(idx, 1);
    }
    v.removed = true;
    for (var i = 0; i < this.vertices.length; i++) {
        this.vertices[i].id = i;
    }
};

Mesh.prototype.removeFace = function( f ) {
    var idx = this.faces.indexOf(f);
    if (idx > -1) {
        this.faces.splice(idx, 1);
    }
    f.removed = true;
    for (var i = 0; i < this.faces.length; i++) {
        this.faces[i].id = i;
    }
};

Mesh.prototype.removeHalfEdge = function( he ) {
    var idx = this.halfedges.indexOf(he);
    if (idx > -1) {
        this.halfedges.splice(idx, 1);
    }
    he.removed = true;
    for (var i = 0; i < this.halfedges.length; i++) {
        this.halfedges[i].id = i;
    }
};

////////////////////////////////////////////////////////////////////////////////
// Euler Operators
////////////////////////////////////////////////////////////////////////////////
// these operations always return a valid mesh (when called on a valid mesh with valid parameters)
// for further descriptions of functions, see the section on Euler Operators at: http://wiki.blender.org/index.php/Dev:2.6/Source/Modeling/BMesh/Design

// splits the edge between v1 and v2 into two, creating a new vert
// v1 -- v2   =>   v1 -- newVert -- v2
// the previously existing halfedges will point to newVert and new ones will be added pointing out from newVert
// returns the new vert, newVert
Mesh.prototype.splitEdgeMakeVert = function( v1, v2, factor ) {
    if ( factor === undefined ) factor = 0.5;
    // get all relevant info
    var he1 = this.edgeBetweenVertices( v1, v2 );
    if (!he1) {
        return false;
    }
    var he2 = he1.opposite;
    var f1  = he1.face;
    var f2  = he2.face;
    var he1_next = he1.next;
    var he2_next = he2.next;

    // compute new vertex position
    var new_pos = new THREE.Vector3( 0, 0, 0 );
    var p1 = new THREE.Vector3( 0, 0 ,0 );
    p1.copy( v1.position );
    var p2 = new THREE.Vector3( 0, 0 ,0 );
    p2.copy( v2.position );

    new_pos.add( p1.multiplyScalar( 1 - factor ) );
    new_pos.add( p2.multiplyScalar( factor ) );

    // create new vertex and halfedges
    var newVert  = this.addVertex( new_pos );
    var he3 = this.addHalfEdge( newVert, v2, f1 );
    var he4 = this.addHalfEdge( newVert, v1, f2 );

    he1.vertex = newVert;
    he2.vertex = newVert;

    // relink everything
    he3.next = he1_next;
    he1.next = he3;
    he1.opposite = he4;
    he4.opposite = he1;

    he4.next = he2_next;
    he2.next = he4;
    he2.opposite = he3;
    he3.opposite = he2;

    f1.halfedge = he3;
    f2.halfedge = he4;

    return newVert;
};

// takes 3 verts, v2 adjacent only to v1 and v3
// v1 -- v2 -- v3   =>   v1 -- v3 
// removes v2 and the edges pointing out from v2 (and relinks the others)
// returns true if successful, false otherwise
Mesh.prototype.joinEdgeKillVert = function( v1, v2, v3 ) {
    // get the halfedges to update
    var he12 = this.edgeBetweenVertices(v1, v2);
    var he32 = this.edgeBetweenVertices(v3, v2);
    // assert(he12, "v1 and v2 must share an edge");
    // assert(he32, "v2 and v3 must share an edge");
    if (he12 === undefined) {
        return false;
    }
    if (he32 === undefined) {
        return false;
    }

    // make sure they're pointing at v2
    // we'll be removing the halfedges pointing away from v2
    he12 = he12.vertex == v2 ? he12 : he12.opposite;
    he32 = he32.vertex == v2 ? he32 : he32.opposite;

    // update vertices to skip over v2
    he12.vertex = he32.opposite.vertex;
    he32.vertex = he12.opposite.vertex;

    // update next halfedges to skip over v2
    he12.next = he32.opposite.next;
    he32.next = he12.opposite.next;

    // make sure the faces don't point to the removed halfedges
    // don't necessarily need to update, but easier to do it than to check
    he12.face.halfedge = he12;
    he32.face.halfedge = he32;

    this.removeHalfEdge(he12.opposite);
    this.removeHalfEdge(he32.opposite);

    // make them opposite each other
    he12.opposite = he32;
    he32.opposite = he12;

    this.removeVertex(v2);

    return true;
};

// takes a face and two vertices on it
// creates a new edge between v1 and v2, splitting the face in two
// if optional arg vertOnF is supplied, ensures that vertOnF remains on face f after the split (otherwise, it is undefined which way the face is split)
// if switchFaces is true, faces will be assigned so that vertOnF lies on the new face
// returns the new face (which points to one of the new halfedges)
Mesh.prototype.splitFaceMakeEdge = function( f, v1, v2, vertOnF, switchFaces ) {
    // Go around f and find halfedges adjacent to v1 and v2
    var heToV2, heToV1;
    var heFromV1, heFromV2;
    // also build a string to track relative locations of v1, v2, and vertOnF
    var vertOrder = "";
    var he = f.halfedge;
    var first = he;
    do {
        if ( he.vertex === v1) {
            heToV1 = he;
            vertOrder += "1"; 
        }
        if ( he.vertex === v2 ) {
            heToV2 = he;
            vertOrder += "2"; 
        }
        if ( he.vertex === vertOnF ) {
            vertOrder += "3";
        }
        if ( he.opposite.vertex === v1 ) {heFromV1 = he; }
        if ( he.opposite.vertex === v2 ) {heFromV2 = he; }
        he = he.next;

    } while ( he !== first );

    // create new halfedges
    var he12      = this.addHalfEdge( v1, v2 );
    var he21      = this.addHalfEdge( v2, v1 );
    he21.opposite = he12;
    he12.opposite = he21;

    // link new halfedges with preexisting ones
    heToV1.next = he12;
    he12.next   = heFromV2;
    heToV2.next = he21;
    he21.next   = heFromV1;

    // create new face
    var newF = this.addFace();

    // assign new halfedges to faces (and vice versa)
    var heOnF;
    // for heOnF to be he21, vertOnF must occur after v1 and before v2
    if   ( vertOrder === "132" 
        || vertOrder === "321" 
        || vertOrder === "213" ) {
        heOnF = he21;
    }
    else {
        // the alternative (also the default if vertOnF isn't given )
        heOnF = he12;
    }
    if ( switchFaces ) {
        heOnF = heOnF == he12 ? he21 : he12;        
    }
    var heOnNewF = heOnF == he12 ? he21 : he12;
    f.halfedge = heOnF;
    heOnF.face = f;
    newF.halfedge = heOnNewF;
    heOnNewF.face = newF;

    // go around each face and make sure halfedges point to it
    for ( var i = 0; i < 2; i++ ) {
        var curFace = i == 0 ? f : newF;

        var he = curFace.halfedge;
        var first = he;
        do {
            he.face = curFace;
            he = he.next;
        } while (he !== first );
    }

    return newF;
};

// takes two faces and two vertices which denote an edge between them
// f1 and f2 must be separated only by the edge (v1, v2)
// removes the edge (v1, v2) and the face f2, then expands f1 to fill the space of both faces
// returns true if successful, false otherwise
Mesh.prototype.joinFaceKillEdge = function( f1, f2, v1, v2 ) {
    var he = this.edgeBetweenVertices( v1, v2 );
    if ( !he ) {
        return false;
    }

    // make sure he points from v1 to v2
    if ( he.vertex !== v2 ) {
        he = he.opposite;
    }

    // make other halfedges point past the edge to be removed
    for ( var i = 0; i < 2; i++ ) {
        var startingHe = i === 0 ? he : he.opposite;

        var heToAdjust = startingHe.next;
        while ( true ) {
            if ( heToAdjust.next === startingHe ) {
                heToAdjust.next = startingHe.opposite.next;
                break;
            }
            heToAdjust = heToAdjust.next;
        }
    }

    // make sure faces don't point at the edge to be removed
    f1.halfedge = he.next;
    f2.halfedge = he.next;

    // make sure verts don't point at the edge to be removed
    v1.halfedge = he.opposite.next;
    v2.halfedge = he.next;

    // make remaining edges point to f1 rather than f2
    var edges = this.edgesOnFace(f2);
    for ( var i = 0; i < edges.length; i++ ) {
        var e = edges[i];
        e.face = f1;
    }

    this.removeFace(f2);
    this.removeHalfEdge(he);
    this.removeHalfEdge(he.opposite);

    for ( var i = 0 ; i < this.vertices.length ; ++i ) {
        var v = this.vertices[i];
        if (v.removed) continue;
        assert(!v.halfedge.removed);
    }
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        var v = this.faces[i];
        if (v.removed) continue;
        assert(!v.halfedge.removed);
    }
    for ( var i = 0 ; i < this.halfedges.length ; ++i ) {
        var v = this.halfedges[i];
        if (v.removed) continue;
        assert(!v.next.removed);
        assert(!v.face.removed);
        assert(!v.vertex.removed);
        assert(!v.opposite.removed);
    }


    return true;
};

// a simpler interface for joinFaceKillEdge
// doesn't give control over which face is removed
Mesh.prototype.joinFaceKillEdgeSimple = function( he ) {
    return this.joinFaceKillEdge(he.face, he.opposite.face, 
                he.opposite.vertex, he.vertex);
}

////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////

function CopyVec(vec) {
    return (new THREE.Vector3(0, 0, 0)).copy(vec);
}

Mesh.prototype.edgeBetweenVerticesFacingFace = function( v1, v2, f ) {
    var e = this.edgeBetweenVertices(v1, v2);
    if (e.face == f) {
        return e;
    }
    else if (e.opposite.face == f) {
        return e.opposite;
    }
    else {
        console.log("edge does not lie on face!", e, f);
    }
}

Mesh.prototype.angleBetweenEdges = function( v, he1, he2 ) {
    var p0 = v.position;
    var p1 = he1.vertex.position;
    var p2 = he2.vertex.position;
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();
    v1.subVectors( p1, p0 );
    v2.subVectors( p2, p0 );

    // Return angle between vectors
    var d1 = v1.length();
    if ( Math.abs(d1) < 0.000001 ) return 0.0;
    var d2 = v2.length();
    if ( Math.abs(d1) < 0.000001 ) return 0.0;
    var cosine = v1.dot(v2) / (d1 * d2);
    if (cosine >= 1.0) {
        return 0.0;
    } else if (cosine <= -1.0) {
        return Math.PI;
    } else {
        return Math.acos(cosine);
    }
}

Mesh.prototype.updateEdgeMidpoints = function() {
    for ( var i = 0; i < this.halfedges.length; i++ ) {
        var he = this.halfedges[i];
        he.midpoint = CopyVec(he.vertex.position).add(he.opposite.vertex.position).multiplyScalar(0.5);
    }
}

Mesh.prototype.updateFaceCentroids = function() {
    for ( var i = 0; i < this.faces.length; i++ ) {
        var f = this.faces[i];
        // get the centroid (inlined for performance)
        var verts    = this.verticesOnFace( f );
        var centroid = new THREE.Vector3( 0, 0, 0 );
        for ( var j = 0 ; j < verts.length ; ++j ) {
            centroid.add( verts[j].position );
        }
        centroid.divideScalar( verts.length );
        f.centroid = centroid;
    }
}

Mesh.prototype.calculateFaceCentroid = function( f ) {
    var verts    = this.verticesOnFace( f );
    var centroid = new THREE.Vector3( 0, 0, 0 );
    for ( var i = 0 ; i < verts.length ; ++i ) {
        centroid.add( verts[i].position );
    }
    centroid.divideScalar( verts.length );
    return centroid;
};

Mesh.prototype.calculateFaceNormal = function( f ) {
    // Get vertices of queried face
    var vertices = this.verticesOnFace( f );

    // Since every face has at least three vertices, we can getpositions of first three.
    // Here we assume that face is planar, even if number of vertices is greater than 3.

    // We find two edges that are not colinear, and their cross product is the normal.
    var nverts = vertices.length;
    var normal = new THREE.Vector3();

    for (var start = 0; start < nverts; start++) {
        var i0 = (start+0) % nverts;
        var i1 = (start+1) % nverts;
        var i2 = (start+2) % nverts;
        var p0 = vertices[i0].position;
        var p1 = vertices[i1].position;
        var p2 = vertices[i2].position;

        var vec1 = new THREE.Vector3();
        vec1.subVectors( p0, p1 );

        var vec2 = new THREE.Vector3();
        vec2.subVectors( p0, p2 );

        // compute average edge length
        var vec3 = new THREE.Vector3();
        vec3.subVectors( p1, p2 );
        var avelen = ( vec1.length() + vec2.length() + vec3.length() ) / 3.0;

        normal.crossVectors( vec1, vec2 );

        // area of square would be like avelen^2 so compare cross product to that
        var square = avelen * avelen;
        var area   = normal.length();
        var ratio  = area / square;
        if ( !isNaN(ratio) && ratio > 1e-06) {
            normal.normalize();
            return normal;
        }

    }
    console.log('oops - tried to find normal of degenerate face');
    return normal;
};

Mesh.prototype.updateFaceNormals = function() {
   for ( var i = 0; i < this.faces.length; ++i ) {
      this.faces[i].normal = this.calculateFaceNormal( this.faces[i] );
   }
};

Mesh.prototype.updateNormals = function() {
    this.updateFaceNormals();
    this.updateVertexNormals();
};

// number of faces that are selected
Mesh.prototype.numSelectedFaces = function() {
    var count = 0;
    for ( var i = 0 ; i < this.faces.length; ++i ) {
        if ( this.faces[i].selected ) {
            count++;
        }
    }
    return count;
};

// list of faces that are selected
Mesh.prototype.getModifiableFaces = function() {
    var faces = [];
    for ( var i = 0 ; i < this.faces.length; ++i ) {
        if ( this.faces[i].selected ) {
            faces.push( this.faces[i] );
        }
    }

    if ( faces.length === 0 ) {
        return this.faces;
    }

    return faces;
};

// list of selected vertices and vertices on faces that are selected
Mesh.prototype.getModifiableVertices = function() {
    var verts_movable = [];
    for ( var i = 0 ; i < this.faces.length; ++i ) {
        var verts = this.verticesOnFace( this.faces[i] );
        for ( var j = 0 ; j < verts.length; ++j ) {
            if ( this.faces[i].selected || verts[j].selected ) {
                verts_movable[ verts[j].id ] = true;
            }
        }
    }
    var verts = [];
    if ( verts_movable.length === 0 ) {
        verts = this.vertices;
    } else {
        for ( var i = 0 ; i < verts_movable.length ; ++i ) {
            if ( verts_movable[i] === true ) {
                verts.push( this.vertices[i] );
            }
        }
    }
    return verts;
};

// list of selected vertices
Mesh.prototype.getSelectedVertices = function() {
    var selectedVerts = [];
    for ( var i = 0 ; i < this.vertices.length; ++i ) {
        if ( this.vertices[i].selected ) {
            selectedVerts.push( this.vertices[i] );
        }
    }
    return selectedVerts;
};

// set list of faces that are selected
Mesh.prototype.setSelectedFaces = function(sel) {
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        this.faces[i].selected = false;
    }
    if (sel === undefined) return;
    for ( var i = 0 ; i < sel.length ; ++i ) {
        var id = sel[i];
        if (id >= 0) { // just skip negative ids, to allow easies toggling
            this.faces[id].selected = true;
        }
    }
};

// set list of verts that are selected
Mesh.prototype.setSelectedVertices = function(sel) {
    for ( var i = 0 ; i < this.vertices.length ; ++i ) {
        this.vertices[i].selected = false;
    }
    if (sel === undefined) return;
    for ( var i = 0 ; i < sel.length ; ++i ) {
        var id = sel[i];
        if (id >= 0) { // just skip negative ids, to allow easies toggling
            this.vertices[id].selected = true;
        }
    }
};

// returns list of selected face ids
Mesh.prototype.getSelectedFaceIds = function() {
    var sel = [];
    for (var i = 0; i < this.faces.length; i++) {
        if (this.faces[i].selected) {
            sel.push(i);
        }
    }
    return sel;
}

// returns list of selected vert ids
Mesh.prototype.getSelectedVertexIds = function() {
    var sel = [];
    for (var i = 0; i < this.vertices.length; i++) {
        if (this.vertices[i].selected) {
            sel.push(i);
        }
    }
    return sel;
}

////////////////////////////////////////////////////////////////////////////////
// Conversions / Constructors
// These are functions used to create meshes - students should have no need to
// modify this code
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.buildFromVerticesAndFaces = function( vertices, faces ) {

    var start = new Date().getTime();

    var n_vertices = vertices.length;
    var n_faces    = faces.length;

    // lets have an edge map, mapping the i,j vertex to a half edge
    function emIJ2Key(i,j) {
        return i + '_' + j;
    }

    function emKey2IJ(key) {
        var parts = key.split('_');
        var ret   = [ parts[0], parts[1] ];
        return ret;
    }

    var edgeMap = {};

    for ( var i = 0 ; i < n_vertices ; ++i ) {
        this.addVertex( vertices[i] );
    }

    for ( var i = 0 ; i < n_faces ; ++i ) {
        var cur_face_ind = faces[i];
        var cur_vertices = [];

        for ( var j = 0 ; j < cur_face_ind.length ; j++ ) {
            cur_vertices.push( this.vertices[cur_face_ind[j]] );
        }

        var f = this.addFace();

        // add halfedges between consecutive vertices
        var n_vertices = cur_vertices.length;
        for ( var j = 0 ; j < n_vertices; j++ ) {
            var next_j = (j + 1) % (n_vertices);
            var he = this.addHalfEdge( cur_vertices[j], cur_vertices[next_j], f );
            edgeMap[ emIJ2Key( cur_vertices[j].id, cur_vertices[next_j].id ) ] = he;
            f.halfedge = he;
        }

        // relink edges around face
        for ( var j = 0 ; j < n_vertices; j++ ) {
            var next_j = (j + 1) % (n_vertices);
            cur_vertices[j].halfedge.next     = cur_vertices[next_j].halfedge;
        }
    }

    for ( var key in edgeMap ) {
        var he1  = edgeMap[ key ];
        var ind  = emKey2IJ( key );
        var key2 = emIJ2Key( ind[1], ind[0] );
        var he2  = edgeMap[ key2 ];
        he1.opposite = he2;
    }

    this.calculateFacesArea();
    this.updateNormals();

    var end = new Date().getTime();
    var elapsed = end - start;

    // console.log( "Conversion took " + elapsed + " ms. Mesh contains " + this.vertices.length + " vertices" );
};

Mesh.prototype.fromOBJ = function( filename, meshLoadCallback ) {

    this.filename = filename;

    filename = 'obj/' + filename; // all obj files are in the obj folder

    var start = new Date().getTime();

    var manager = new THREE.LoadingManager();

    // load using the three js loading manager plus pass reference to current mesh
    var loader = new OBJLoader ( manager );
    var mesh   = this;

    loader.load ( filename, function( vertices, faces ) {
        mesh.buildFromVerticesAndFaces( vertices, faces );
        meshLoadCallback();
    });
};

// this code is ugly since translateions and rotations need to be treated separately
Mesh.prototype.applyFilters = function( values ) {
    //console.log(values);
    if ( values == undefined ) return;

    // first parse translations & rotations
    var translation = new THREE.Vector3 ( values.translateX, values.translateY, values.translateZ );
    var rotation    = new THREE.Vector3 ( values.rotateX, values.rotateY, values.rotateZ  );
    if ( translation.x !== 0 || translation.y !== 0 || translation.z !== 0  ) {
        Filters.translate( this, translation );
    }

    if ( rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0 ) {
        Filters.rotate( this, rotation );
    }

    //then all other values
    for ( var prop in values) {
        if ( (prop in Gui.defaults ) && ( values[prop] !== Gui.defaults[prop]) ) {
            var val = values[prop];
            if ( prop === "translateX"  ||  prop === "translateY" ||  prop === "translateZ" ||
                 prop === "rotateX" || prop === "rotateY" || prop === "rotateZ") {
                continue;
            }
            Filters[prop]( this, val );
        }
    }
}

// generates the THREE.js geometry that's actually rendered (base mesh, selections, halfedge vis, etc)
Mesh.prototype.toBufferGeometry = function() {
    // useful variables and default settings
    var v_pos, v_nor, v_col;
    var i = 0, j = 0, k = 0, sel_k = 0, l = 0, idx = 0;

    var arrowSize = 0.05;

    this.updateFaceCentroids();
    this.updateEdgeMidpoints();

    // precalculate stuff for halfedge vis
    for ( var i = 0; i < this.halfedges.length; i++ ) {
        var he = this.halfedges[i];
        // he.avgNormal = CopyVec(he.face.normal).add(he.opposite.face.normal).normalize();
        var edgeDir = CopyVec(he.vertex.position).sub(he.opposite.vertex.position).normalize();
        he.shortTangent = CopyVec(he.face.normal).cross(edgeDir).normalize().multiplyScalar(0.05);
        he.shortDir = edgeDir.multiplyScalar(arrowSize);
    }

    var hideSelected = Gui.hidden;

    var n_faces = this.faces.length;

    var n_triangles = 0;
    var n_selected_triangles = 0;
    for ( i = 0 ; i < n_faces ; ++i ) {
        var vertices = this.verticesOnFace( this.faces[i] );
        // need to figure number of vertices for a face
        if ( this.faces[i].selected && !hideSelected ) {
            n_selected_triangles += vertices.length - 2;
        } else {
            n_triangles += vertices.length - 2;
        }
    }

    // geometries
    var meshGeometry        = new THREE.BufferGeometry();
    var selectedFacesGeo    = new THREE.BufferGeometry();
    var faceNormalsGeo      = new THREE.Geometry();
    var vertexNormalsGeo    = new THREE.Geometry();
    var wireframeGeo        = new THREE.Geometry();
    var verticesGeo         = new THREE.Geometry();
    var selectedVerticesGeo = new THREE.Geometry();
    var structureVisGeo     = new THREE.Geometry();
    var edgeStructureVisGeo     = new THREE.Geometry();

    var unselectedVertexColors = [];

    // buffers for bufferGeometries
    // each face - 3 vertices - 3 attributes
    var vertex_positions     = new Float32Array( n_triangles * 3 * 3 );
    var sel_vertex_positions = new Float32Array( n_selected_triangles * 3 * 3 );
    var vertex_normals       = new Float32Array( n_triangles * 3 * 3 );
    var sel_vertex_normals   = new Float32Array( n_selected_triangles * 3 * 3 );
    var vertex_colors        = new Float32Array( n_triangles * 3 * 3 );
    var sel_vertex_colors    = new Float32Array( n_selected_triangles * 3 * 3 );

    // text billboards
    var textSprites = [];

    for ( i = 0 ; i < n_faces ; i++ ) {
        var f = this.faces[i];

        // Face normals and halfedge vis
        centroid = f.centroid;

        // arrow from face to edge
        if (Main.displaySettings.wireframe) {
            var he = f.halfedge;
            var midpoint = he.midpoint.add(he.shortTangent);

            structureVisGeo.vertices.push( centroid );
            structureVisGeo.vertices.push( midpoint );
            var arrowDirInv = CopyVec(centroid).sub(midpoint).normalize().multiplyScalar(arrowSize);
            structureVisGeo.vertices.push( midpoint );
            structureVisGeo.vertices.push( CopyVec(midpoint).add(arrowDirInv).add(he.shortDir) );
            structureVisGeo.vertices.push( midpoint );
            structureVisGeo.vertices.push( CopyVec(midpoint).add(arrowDirInv).sub(he.shortDir) );
        }

        // face idx billboard
        if ( Main.displaySettings.showIdLabels ) {
            var sprite = makeTextSprite(f.id, {
                borderColor: "black",
                backgroundColor: {r:255, g:0, b:0, a:1},
            });
            var pos = CopyVec(f.centroid).add(CopyVec(f.normal).normalize().multiplyScalar(0.1));
            sprite.position.set(pos.x, pos.y, pos.z);
            textSprites.push(sprite);
        }

        // face normals
        if ( Main.displaySettings.showFN ) {
            var fn_p2 = new THREE.Vector3 ();
            fn_p2.copy ( f.normal );
            if ( fn_p2.length() > 1e-06 ) fn_p2.normalize();
            fn_p2.normalize();
            fn_p2.multiplyScalar( 0.2 );
            fn_p2.add( centroid );

            faceNormalsGeo.vertices.push( centroid );
            faceNormalsGeo.vertices.push( fn_p2 );
        }

        // triangulate faces
        var verts = [];
        var f_verts = this.verticesOnFace( f );

        verts[0] = f_verts[0];

        var positions_ptr = vertex_positions;
        var normals_ptr   = vertex_normals;
        var colors_ptr    = vertex_colors;
        idx = k;

        if ( f.selected && !hideSelected ) {
            positions_ptr = sel_vertex_positions;
            normals_ptr   = sel_vertex_normals;
            colors_ptr    = sel_vertex_colors;
            idx = sel_k;
        }

        for ( j = 1 ; j < f_verts.length - 1 ; ++j ) {
            var next_j = j + 1;
            verts[1] = f_verts[j];
            verts[2] = f_verts[next_j];

            for ( l = 0 ; l < 3 ; ++l ) {
                v_pos = verts[l].position;
                if ( Main.displaySettings.shading === "smooth" ) {
                    v_nor = verts[l].normal;
                } else {
                    v_nor = f.normal;
                }
                v_col = verts[l].color;

                colors_ptr[ idx ]     = v_col.x;
                colors_ptr[ idx + 1 ] = v_col.y;
                colors_ptr[ idx + 2 ] = v_col.z;

                normals_ptr[ idx ]     = v_nor.x;
                normals_ptr[ idx + 1 ] = v_nor.y;
                normals_ptr[ idx + 2 ] = v_nor.z;

                positions_ptr[ idx ]     = v_pos.x;
                positions_ptr[ idx + 1 ] = v_pos.y;
                positions_ptr[ idx + 2 ] = v_pos.z;

                // vertex normals
                if ( Main.displaySettings.showVN ) {
                    var vn_p1 = new THREE.Vector3();
                    var vn_p2 = new THREE.Vector3();

                    vn_p1.copy( v_pos );
                    vn_p2.copy(  verts[l].normal );
                    if ( vn_p2.length() > 1e-0 ) vn_p2.normalize();
                    vn_p2.multiplyScalar( 0.2 );
                    vn_p2.add( vn_p1 );
                    vertexNormalsGeo.vertices.push( vn_p1 );
                    vertexNormalsGeo.vertices.push( vn_p2 );
                }
                if ( f.selected && !hideSelected ) {
                    sel_k += 3;
                    idx = sel_k;
                } else {
                    k += 3;
                    idx = k;
                }
            }
        }
    }

    for ( j = 0 ; j < this.halfedges.length ; ++j ) {
        var he = this.halfedges[j];

        // edge arrows
        if ( Main.displaySettings.wireframe ) {
            wireframeGeo.vertices.push(he.vertex.position);
            wireframeGeo.vertices.push(he.opposite.vertex.position);

            var edgeVec = CopyVec(he.shortDir).normalize();
            var edgeVec = edgeVec.multiplyScalar(0.1);

            // edge points to p1
            var p1 = CopyVec(he.vertex.position).add(he.shortTangent).sub(edgeVec);
            var p2 = CopyVec(he.opposite.vertex.position).add(he.shortTangent).add(edgeVec.normalize().multiplyScalar(0.05));
            edgeStructureVisGeo.vertices.push(p1);
            edgeStructureVisGeo.vertices.push(p2);
            
            var arrowOffsetDir = CopyVec(edgeVec).cross(he.face.normal).normalize().multiplyScalar(arrowSize);
            var p1ArrowBase = CopyVec(p1).sub(edgeVec.normalize().multiplyScalar(arrowSize));
            edgeStructureVisGeo.vertices.push(p1);
            edgeStructureVisGeo.vertices.push(CopyVec(p1ArrowBase).add(arrowOffsetDir));
            edgeStructureVisGeo.vertices.push(p1);
            edgeStructureVisGeo.vertices.push(CopyVec(p1ArrowBase).sub(arrowOffsetDir));
        }

        // edge billboard
        if ( Main.displaySettings.showIdLabels ) {
            var sprite = makeTextSprite(he.id, {
                borderColor: "black",
                backgroundColor: {r:255, g:255, b:0, a:1},
            });
            var pos = CopyVec(he.vertex.position).multiplyScalar(0.66)
                .add(CopyVec(he.opposite.vertex.position).multiplyScalar(0.33))
                .add(CopyVec(he.face.normal)
                    .normalize()
                    .multiplyScalar(0.1));
            sprite.position.set(pos.x, pos.y, pos.z);
            textSprites.push(sprite);
        }
    }

    for ( j = 0 ; j < this.vertices.length ; ++j ) {
        var vert = this.vertices[j];

        // vertex billboard
        if ( Main.displaySettings.showIdLabels ) {
            var sprite = makeTextSprite(vert.id, {
                borderColor: "black",
                backgroundColor: {r:100, g:100, b:255, a:1},
            });
            // bias it back a bit so selected vertices show over
            var pos = CopyVec(vert.position).add(CopyVec(vert.normal).normalize().multiplyScalar(-0.001));
            sprite.position.set(pos.x, pos.y, pos.z);
            textSprites.push(sprite);
        }

        // vertex dots
        if ( vert.selected && !hideSelected ) {
            selectedVerticesGeo.vertices.push( vert.position );
        } else {
            verticesGeo.vertices.push( vert.position );
            // var vc = vert.color;
            // unselectedVertexColors.push( new THREE.Color(vc.x, vc.y, vc.z) );
            unselectedVertexColors.push( new THREE.Color(255, 255, 255) );
        }
    }

    verticesGeo.colors = unselectedVertexColors;

    // assign BufferGeometry buffers
    meshGeometry.addAttribute( "position", new THREE.BufferAttribute( vertex_positions, 3 ) );
    meshGeometry.addAttribute( "color",    new THREE.BufferAttribute( vertex_colors, 3 ) );
    meshGeometry.addAttribute( "normal",   new THREE.BufferAttribute( vertex_normals, 3 ) );

    selectedFacesGeo.addAttribute( "position", new THREE.BufferAttribute( sel_vertex_positions, 3 ) );
    selectedFacesGeo.addAttribute( "color",    new THREE.BufferAttribute( sel_vertex_colors, 3 ) );
    selectedFacesGeo.addAttribute( "normal",   new THREE.BufferAttribute( sel_vertex_normals, 3 ) );

    return {
        textSprites: textSprites,
        geometries: {
            main: meshGeometry,
            faceNormals: faceNormalsGeo,
            vertexNormals: vertexNormalsGeo,
            wireframe: wireframeGeo,
            selectedFaces: selectedFacesGeo,
            vertices: verticesGeo,
            selectedVertices: selectedVerticesGeo,
            structureVisualization: structureVisGeo,
            edgeStructureVisualization: edgeStructureVisGeo,
        }
    }
};

Mesh.prototype.toOBJ = function( mesh ) {
        function destroyClickedElement( event ) {
            document.body.removeChild( event.target );
        }

        var objContent = "# Princeton COS426 OBJ model\n\n";

        for ( var i = 0 ; i < this.vertices.length ; ++i ) {
            var p = this.vertices[i].position;
            objContent += 'v ' + p.x + ' ' + p.y + ' ' + p.z + "\n";
        }

        for ( var i = 0 ; i < this.faces.length ; ++i ) {
            objContent += 'f';
            var face  = this.faces[i];
            var verts = this.verticesOnFace( face );
            for ( var j = 0 ; j < verts.length ; ++j ) {
                objContent += ' ' + (verts[j].id + 1);
            }
            objContent += "\n";
        }

        var textFileAsBlob = new Blob([objContent], {type:'text/obj'});
        var fileNameToSaveAs = "mesh.obj";

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild( downloadLink );
        downloadLink.click();
    }

// add event listener that will cause 'O' key to download mesh
window.addEventListener( 'keyup', function( event ) {
    // only respond to 'O' key
    if ( event.which == 79 ) {
        Main.mesh.toOBJ();
    }
});

////////////////////////////////////////////////////////////////////////////////
// Misc Utilities
////////////////////////////////////////////////////////////////////////////////

// from http://stackoverflow.com/questions/15313418/javascript-assert
function assert(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
  return condition
}
