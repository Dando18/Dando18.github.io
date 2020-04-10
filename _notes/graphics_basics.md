---
title: "Graphics Basics"
excerpt: "Notes on computer graphics basics"
collection: notes
permalink: /notes/graphics-basics
---

## Graphics Basics


### OpenGL Basic Pipeline

Below is the basic OpenGL pipeline (disregarding things like geometry and tesselation shaders). For simplicity these notes talk about rendering of a single model.

Input --> Vertex Processing --> Primitive Processing --> Rasterization --> Fragment Processing --> Pixel Processing --> Frame Buffer

- _Input:_ This is all the model data such as vertices, normals, textures, position, etc...
- _Vertex Processing:_ Typically a GLSL vertex-shader; this is a per-vertex operation applied to the vertices of the model which is intended to map coordinates in local-space all the way into clip-space.
- _Primitive Processing:_ Collecting geometry basics such as points, lines, and triangles.
- _Rasterization:_ OpenGL turns geometry into fragments or pixels in screen space.
- _Fragment Processing:_ Typically a GLSL fragment shader; this is a per-pixel operation on the rendered pixels of the model which is responsible for coloring that pixel.
- _Pixel Processing:_ OpenGL putting pixels in appropriate locations according to viewport
- _Frame Buffer:_ The final destination. The buffer of a frame of pixels, which the display uses to write pixels to the physical screen.

### Vertex Processing & Vertex Shaders
Vertex shaders map local object coordinates to clip-space coordinates. Clip-space is a -1.0 to 1.0 cube, which OpenGL and the graphics hardware map to screen coordinates. Anything outside the cube is clipped.

This is typically done thru matrix transformations, which, when applied give a 4D position in clip-space, which is then mapped to NDC space using `position3d = clipPosition.xyz / clipPosition.w`. This is automatically performed by OpenGL on the graphics card.

An example simple vertex shader looks like:

```glsl
/* attributes are passed element-wise from a buffer */
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;

/* uniform variables are the same for every execution of shader */
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 perspectiveMatrix;

/* varying values are passed to fragment shader */
varying vec3 v_normal;
varying vec4 v_color;

void main() {
    /* set v_normal to pass to fragment shader */
    v_normal = a_normal;

    /* gl_Position sets the clip-space position for this vertex;
       GLSL automatically does matrix operations */
    gl_Position = perspectiveMatrix * viewMatrix * modelMatrix * a_position;
}
```

### Fragment Shaders
Fragment shaders are called on each rasterized pixel. They can receive info from the geometry, which caused this pixel to be rendered, via the vertex shader. They typically set `gl_FragColor`, which provides the color for this pixel.

A simple fragment shader from the above: 

```glsl
/* have to set floating precision first */
precision mediump float;

/* uniform values can also be used here */
// ...

/* get varying attributes */
varying vec3 v_normal;
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
```

### Transformations
Objects, say a cube, store their vertices in local coordinates. That is a coordinate system with its origin on the object (usually at the center or a corner). This is done through 4 transformations done using matrix transformations. The last transformation, clip to screen space, is done automatically by OpenGL and the hardware.

Transformations are done via matrices and are undone after drawing the model using inverses. Say $$M_i \in \mathbb{R}^{4\times 4}$$ represents some arbitrary translation. Then $$M_i x$$, where $$x \in \mathbb{R}^{4}$$ is the local position of some vertex, will translate it into global coordinates.

Usually we want to draw more than 1 object, so we need to undo our transformations. This is easy using inverse matrices. The above transformation done and undone can be represented by $$M_i x M_i^{-1}$$. We can do this for arbitrarily many transformations: $$M_i M_j M_k x M_k^{-1} M_j^{-1} M_i^{-1}$$.

#### Model to World
The first transformation needs to transform model coordinates to global so that all objects are draw around a global origin. This typically requires translation, rotation, and scaling. The generated transformation matrix is often called the _Model Matrix_.

Say $$T_i$$ represents the translation of the object into world coordinates, $$R_i$$ the rotation, and $$S_i$$ the scaling. Then the transformation into world coordinates can be given by,

$$ ModelMatrix = S_iR_iT_i .$$

_Scaling:_

$$ S = \begin{bmatrix}
S_x & 0  & 0 & 0 \\ 
 0 & S_y & 0 & 0 \\ 
 0 &  0 & S_z & 0 \\
0 & 0 & 0 & 1 \\
\end{bmatrix}$$ 

_Rotation:_

$$ R_x = \begin{bmatrix}
1 & 0  & 0 & 0 \\ 
0 & \cos\theta & -\sin\theta & 0 \\ 
0 &  \sin\theta & \cos\theta & 0 \\
0 & 0 & 0 & 1 \\
\end{bmatrix}$$

$$ R_y = \begin{bmatrix}
\cos\theta & 0  & \sin\theta & 0 \\ 
0 & 1 & 0 & 0 \\ 
-\sin\theta &  0 & \cos\theta & 0 \\
0 & 0 & 0 & 1 \\
\end{bmatrix}$$

$$ R_z = \begin{bmatrix}
\cos\theta & -\sin\theta & 0 & 0 \\ 
\sin\theta & \cos\theta & 0 & 0 \\
0 & 0  & 1 & 0 \\ 
0 & 0 & 0 & 1 \\
\end{bmatrix}$$

_Translation:_

$$ T = \begin{bmatrix}
1 & 0  & 0 & T_x \\ 
0 & 1 & 0 & T_y \\ 
0 &  0 & 1 & T_z \\
0 & 0 & 0 & 1 \\
\end{bmatrix}$$ 

#### World to Camera

#### Camera to Clip
