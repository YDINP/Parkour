/**
 * qml: objectName:
qml: asset:Tiled::EditableMap(0x77f9870)
qml: readOnly:false
qml: fileName:D:/Workspace/CCC/parkour-hero/assets/resources/map/bush/bush01.tmx
qml: modified:false
qml: isTileMap:true
qml: isTileset:false
qml: width:616
qml: height:10
qml: size:QSize(616, 10)
qml: tileWidth:64
qml: tileHeight:64
qml: infinite:false
qml: hexSideLength:0
qml: staggerAxis:1
qml: staggerIndex:0
qml: orientation:1
qml: renderOrder:0
qml: backgroundColor:#000000
qml: layerDataFormat:3
qml: layerCount:5
qml: tilesets:Tiled::EditableTileset(0x7a418b0),Tiled::EditableTileset(0x7a41d60),Tiled::EditableTileset(0x7a1c3c0)
qml: selectedArea:Tiled::EditableSelectedArea(0x77f3660)
qml: currentLayer:Tiled::EditableObjectGroup(0x7a31140)
qml: selectedLayers:Tiled::EditableObjectGroup(0x7a31140)
qml: selectedObjects:
qml: objectNameChanged:function() { [native code] }
qml: property:function() { [native code] }
qml: setProperty:function() { [native code] }
qml: properties:function() { [native code] }
qml: setProperties:function() { [native code] }
qml: removeProperty:function() { [native code] }
qml: resolvedProperty:function() { [native code] }
qml: resolvedProperties:function() { [native code] }
qml: modifiedChanged:function() { [native code] }
qml: fileNameChanged:function() { [native code] }
qml: undo:function() { [native code] }
qml: redo:function() { [native code] }
qml: macro:function() { [native code] }
qml: currentLayerChanged:function() { [native code] }
qml: selectedLayersChanged:function() { [native code] }
qml: selectedObjectsChanged:function() { [native code] }
qml: layerAt:function() { [native code] }
qml: removeLayerAt:function() { [native code] }
qml: removeLayer:function() { [native code] }
qml: insertLayerAt:function() { [native code] }
qml: addLayer:function() { [native code] }
qml: addTileset:function() { [native code] }
qml: replaceTileset:function() { [native code] }
qml: removeTileset:function() { [native code] }
qml: usedTilesets:function() { [native code] }
qml: merge:function() { [native code] }
qml: merge:function() { [native code] }
qml: resize:function() { [native code] }
qml: resize:function() { [native code] }
qml: resize:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: autoMap:function() { [native code] }
qml: screenToTile:function() { [native code] }
qml: screenToTile:function() { [native code] }
qml: tileToScreen:function() { [native code] }
qml: tileToScreen:function() { [native code] }
qml: screenToPixel:function() { [native code] }
qml: screenToPixel:function() { [native code] }
qml: pixelToScreen:function() { [native code] }
qml: pixelToScreen:function() { [native code] }
qml: pixelToTile:function() { [native code] }
qml: pixelToTile:function() { [native code] }
qml: tileToPixel:function() { [native code] }
qml: tileToPixel:function() { [native code] }
qml: setSize:function() { [native code] }
qml: setTileSize:function() { [native code]

splitMap(map)

	About,AboutQt,AddAnotherMap,AddExternalTileset,AddFolderToProject,AddGroupLayer,AddImageLayer,AddMap,AddObjectLayer,AddStampVariation,AddTileLayer,AddTiles,AutoMap,AutoMapWhileDrawing,Autocrop,BucketFillTool,ClearRecentFiles,ClearRecentProjects,ClearView,Close,CloseAll,CloseProject,Copy,CreateEllipseObjectTool,CreatePointObjectTool,CreatePolygonObjectTool,CreateRectangleObjectTool,CreateTemplateTool,CreateTextObjectTool,CreateTileObjectTool,CropToSelection,Cut,Delete,Documentation,Donate,DuplicateLayers,DuplicateObjects,DynamicWrappingToggle,EditCollision,EditCommands,EditPolygonTool,EditTerrain,EditWang,EraserTool,Export,ExportAs,ExportAsImage,FitInView,FlipHorizontal,FlipVertical,FollowWarp,FullScreen,GroupLayers,HighlightCurrentLayer,HighlightHoveredObject,JumpToObject,LabelForHoveredObject,LabelsForAllObjects,LabelsForSelectedObjects,LayerOffsetTool,LayerProperties,LayerViaCopy,LayerViaCut,LoadWorld,MagicWandTool,MapProperties,MergeLayersDown,MoveLayersDown,MoveLayersUp,MoveObjectsDown,MoveObjectsUp,NewMap,NewStamp,NewTileset,NewWorld,NoLabels,ObjectSelectionTool,OffsetMap,Open,OpenFileInProject,OpenProject,PaintTileRectangle,Paste,PasteInPlace,Preferences,ProjectProperties,Quit,RandomMode,RectangleChain,Redo,RefreshProjectFolders,Reload,RemoveLayers,RemoveMap,RemoveObjects,RemoveTiles,ReopenClosedFile,ResizeMap,RotateLeft,RotateRight,Save,SaveAll,SaveAs,SaveProjectAs,SelectAll,SelectInverse,SelectNextLayer,SelectNextTileset,SelectNone,SelectPreviousLayer,SelectPreviousTileset,SelectSameTileTool,ShapeFillTool,ShapeFillTool.CircleFill,ShapeFillTool.RectangleFill,ShowAnimationEditor,ShowGrid,ShowObjectReferences,ShowTileAnimations,ShowTileCollisionShapes,ShowTileObjectOutlines,SnapNothing,SnapToFineGrid,SnapToGrid,SnapToPixels,SplitMap,StampTool,TerrainTool,TileSelectionTool,TilesetProperties,ToggleLockOtherLayers,ToggleLockSelectedLayers,ToggleOtherLayers,ToggleSelectedLayers,Undo,UngroupLayers,WangFillMode,WangTool,WorldMoveMapTool,ZoomIn,ZoomNormal,ZoomOut
 */

function split(map, c) {
	let format = tiled.mapFormat("tmx")
	let baseName = FileInfo.baseName(map.fileName)
	let folder = FileInfo.path(map.fileName);

	let partIndex = 0;
	let cursor = 0;
	while (cursor < map.width) {
		let copiedMap = format.read(map.fileName)
		let partName = baseName + "_" + partIndex + ".tmx"
		let part_full_name = folder + "/" + partName;
		format.write(copiedMap, part_full_name)
		tiled.open(part_full_name)
		const partmap_open = tiled.activeAsset

		let neww = c;
		let final = cursor + c - map.width;
		if (final > 0) {
			neww = c - final
		}
		tiled.log(neww)
		partmap_open.resize(Qt.size(neww, map.height), Qt.point(-c * partIndex, 0), true)
		partIndex++
		cursor += c;
	}
	tiled.trigger("SaveAll")
}


let splitMapWithLength = tiled.registerAction("SplitMapWithLength", function (/* action */) {
	const map = tiled.activeAsset;
	if (!map.isTileMap) {
		tiled.alert("Not a tile map!");
		return;
	}
	let c = tiled.prompt("多少格分为一个文件", 100);
	if (c == "") {
		return;
	}
	c = Number(c);
	split(map, c)
});

let splitMapWithCount = tiled.registerAction("SplitMapWithCount", function (/* action */) {
	const map = tiled.activeAsset;
	if (!map.isTileMap) {
		tiled.alert("Not a tile map!");
		return;
	}
	let c = tiled.prompt("分隔成多少个文件", 3);
	if (c == "") {
		return;
	}
	c = Number(c);
	split(map, map.width / c)
});


splitMapWithLength.text = "Split Map with Fixed Width";
splitMapWithLength.shortcut = "Ctrl+D";


splitMapWithCount.text = "Split Map with Fixed Count";
splitMapWithCount.shortcut = "Ctrl+B";

tiled.extendMenu("Map", [
	{ separator: true },
	{ action: "SplitMapWithLength" },
	{ action: "SplitMapWithCount" },
]);
