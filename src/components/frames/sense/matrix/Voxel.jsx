// Voxel.jsx
// Components/Frames/Sense

import m from 'mithril'
import _ from 'lodash'
import {Group,
        Vector3,
        TextureLoader,
        CubeGeometry,
        MeshLambertMaterial,
        Mesh,
        AmbientLight,
    } from 'three';
    import { Component, System, World } from 'ecsy';
    import {
        initialize,
        Parent,
        Transform,
        Object3D,
    } from '../../../../../vendor/voxeljs-next/node_modules/ecsy-three/build/ecsy-three.module.js';
    import * as util from "../../../../../vendor/voxeljs-next/src/utils.js"
    import {MouseCursor, MouseSystem} from '../../../../../vendor/voxeljs-next/src/ecsy/mouse.js'
    import {KeyboardControls, KeyboardSystem} from '../../../../../vendor/voxeljs-next/src/ecsy/keyboard.js'
    import {VoxelLandscape, VoxelSystem, VoxelTextures} from '../../../../../vendor/voxeljs-next/src/ecsy/voxels.js'
    import {ActiveBlock, Highlight, HighlightSystem} from '../../../../../vendor/voxeljs-next/src/ecsy/highlight.js'
    import {StagePosition, StageRotation} from '../../../../../vendor/voxeljs-next/src/ecsy/camera_gimbal.js'
    //import {WebXRSystem, WebXRButton, WebXRController} from '../../../../../vendor/voxeljs-next/src/ecsy/webxr.js'
    //import {FullscreenSystem, FullscreenButton} from '../../../../../vendor/voxeljs-next/src/ecsy/fullscreen.js'
    import {DashboardDOMOvleraySystem, DomDashboard, DashboardVisible} from "../../../../../vendor/voxeljs-next/src/ecsy/dashboard.js"



const Voxel = {
	oncreate ({dom}) {
    /*
    class VoxelWebXRControllerSystem extends System {
        execute(delta, time) {
            this.queries.controllers.added.forEach(ent => {
                let con = ent.getComponent(WebXRController);
                let mesh2 = new Mesh(
                    new CubeGeometry(1.1,0.1,0.1),
                    new MeshLambertMaterial({
                        color:'yellow',
                    }));
                ent.addComponent(Transform)
                ent.addComponent(Object3D, {value: mesh2})
                ent.addComponent(Parent, con.controller)
            })
            this.queries.controllers.results.forEach(ent => {
                let con = ent.getComponent(WebXRController)
                if(con.selected) {
                    console.log("xr is pressed ", con.index)
                }
            })
        }
    }
    VoxelWebXRControllerSystem.queries = {
        controllers: {
            components:[WebXRController],
            listen: {
                added:true,
                removed:true,
            }
        },
    }
*/

    const Y_AXIS = new Vector3(0,1,0)
    const SPEED = 0.1

    // Create a new world to hold all our highlights and systems
    let world = new World();

    // Register all of the systems we will need
    world.registerSystem(VoxelSystem)
    world.registerSystem(KeyboardSystem)
    world.registerSystem(MouseSystem)
    world.registerSystem(HighlightSystem)
    world.registerSystem(DashboardDOMOvleraySystem)
    //world.registerSystem(WebXRSystem);
    //world.registerSystem(FullscreenSystem);

    // Initialize the default sets of highlights and systems
    let data = initialize(world, {canvas: dom.querySelector('canvas.sts-canvas')});
    let {scene, renderer, camera} = data.entities;
    console.log("got it",data)

    // Modify the position for the default camera
    // let transform = camera.getMutableComponent(Transform);
    // transform.position.z = 5;

    //scene.addComponent(FullscreenButton);
    //scene.addComponent(WebXRButton);



    new TextureLoader().load('./dummy.jpg')


    // add a dashboard to the scene
    let dashboard = scene.addComponent(DomDashboard)
        .addComponent(DashboardVisible)

    //set the active block to type 3 (TNT)
    scene.addComponent(ActiveBlock, {type:3})

    // a pivot for rotating the world around
    let stageRot = world.createEntity()
        .addComponent(Object3D, {value: new Group()})
        .addComponent(Transform)
        .addComponent(Parent, {value: scene})
        .addComponent(KeyboardControls, { mapping: {
                ArrowLeft:(ent) => {
                    let trans = ent.getMutableComponent(Transform)
                    trans.rotation.y -= util.toRad(3)
                },
                ArrowRight: (ent) => {
                    let trans = ent.getMutableComponent(Transform)
                    trans.rotation.y += util.toRad(3)
                }
            }})
        .addComponent(StageRotation) // StageRotation is how the rest of the system can use this

    // a position for moving the world around
    let stagePos = world.createEntity()
        .addComponent(Object3D, {value: new Group})
        .addComponent(Transform)
        .addComponent(Parent, {value:stageRot})
        .addComponent(KeyboardControls, { mapping: {
                ArrowUp:(ent) => {
                    let trans = ent.getMutableComponent(Transform)
                    let stageRot = ent.getComponent(Parent).value
                    const dir = new Vector3(0,0,1)
                    dir.applyAxisAngle(Y_AXIS, -stageRot.getComponent(Transform).rotation.y)
                    let d2 = dir.normalize().multiplyScalar(SPEED)
                    const vel = d2.multiplyScalar(4)
                    trans.position.x += vel.x;
                    trans.position.z += vel.z;
                },
                ArrowDown: (ent) => {
                    let trans = ent.getMutableComponent(Transform)
                    let stageRot = ent.getComponent(Parent).value
                    const dir = new Vector3(0,0,1)
                    dir.applyAxisAngle(Y_AXIS, -stageRot.getComponent(Transform).rotation.y)
                    let d2 = dir.normalize().multiplyScalar(SPEED)
                    const vel = d2.multiplyScalar(-4)
                    trans.position.x += vel.x;
                    trans.position.z += vel.z;
                },
                a:(ent) => {
                    console.log("slide left");
                },
                d:(ent) => {
                    console.log("slide right");
                },
                t:(ent) => {
                    console.log("need to show the dashboard")
                    dashboard.addComponent(DashboardVisible)
                }
            }})
        .addComponent(StagePosition) // StagePosition

    //make the actual landscape
    world.createEntity()
        .addComponent(Transform)
        .addComponent(Parent, {value: stagePos})
        .addComponent(VoxelLandscape, {
            make_voxel: (x,y,z) => {
                // make a floor between -2 and -5
                if(y < -2 && y > -5) return 1 // grass
                // make a 4x4x4 cube floating in space
                if(    x > 0 && x < 5
                    && z > 5 && z < 10
                    && y > 5 && y < 10
                ) return 2 // brick
                return 0
            }
            ,
        })
        .addComponent(VoxelTextures,{
            textures:[
                {
                    src:'./textures/dirt.png'
                },
                {
                    src:'./textures/grass.png'
                },
                {
                    src:'./textures/brick.png'
                },
                {
                    src:'./textures/tnt.png'
                },
                {
                    src:'./textures/heart.png',
                },
        ]})

    world.execute();

    // create a mouse cursor so that we can look for mouse events
    world.createEntity()
        .addComponent(MouseCursor)

    //create a ThreeJS mesh as the highlighter
    let mesh = new Mesh(
        new CubeGeometry(1.1,1.1,1.1, 4,4,4).translate(0.5,0.5,0.5),
        new MeshLambertMaterial({
            color:'green',
            depthTest:true,
            wireframe:true,
            wireframeLinewidth: 3,
            transparent: true,
            opacity: 0.5,
        }));

    // make the highlighter
    let highlight = world.createEntity()
        .addComponent(Transform)
        .addComponent(Object3D, { value: mesh})
        .addComponent(Parent, {value: stagePos})
        .addComponent(Highlight)

    //add some ambient light or the highlight mesh won't have any color
    world.createEntity()
        .addComponent(Object3D, { value: new AmbientLight()})
        .addComponent(Parent, {value: scene})



	},
	view: ({attrs}) => <div class="sts-canvas-wrapper"><canvas class="sts-canvas" /></div>
}
export default Voxel;