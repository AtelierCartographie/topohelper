<script>
    import { onMount } from "svelte";
    import * as topohelper from "../index.js";
    import france from "./france_commune_2022.json";

    // Highlight
    import { Highlight } from "svelte-highlight";
    import { javascript } from "svelte-highlight/languages";
    // Style list: https://svhe.onrender.com/styles
    import github from "svelte-highlight/styles/github";

    const language = javascript;

    const op1 = topohelper.from(france).centroids({ better: true });

    const op2 = topohelper.from(france).project({
        proj: "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    });
    const op3 = topohelper
        .from(france)
        .project({
            proj: "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
        })
        .unproject();

    onMount(() => {
        document
            .querySelector("#demo-1")
            .appendChild(op1.view({ zoom: true, tooltip: true }));

        document
            .querySelector("#demo-2")
            .appendChild(op2.view({ zoom: true, tooltip: true }));

        document
            .querySelector("#demo-3")
            .appendChild(op3.view({ zoom: true, tooltip: true }));
    });
</script>

<svelte:head>
    {@html github}
</svelte:head>

<h1>TopoJSON Helper</h1>
<p>
    Topohelper is a javascript library that will help you manipulate topoJSON
    with ease. From a geoJSON or a topoJSON, apply precise operations to take
    full advantage of this great format.
</p>
<h2>Install</h2>
<Highlight {language} code="import topohelper from 'topohelper'" />

<h2>Examples</h2>
<div id="demo-1">
    <h3>Add a centroids layer</h3>
    <Highlight
        {language}
        code={`topohelper.from(france)
          .centroids({better: true})`}
    />
</div>

<div id="demo-2">
    <h3>Project a topojson</h3>
    <Highlight
        {language}
        code={`const topoProject = topohelper.from(france)
          .project({proj: "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"})`}
    />
</div>

<div id="demo-3">
    <h3>Unproject a projected topojson</h3>
    <Highlight {language} code={`topoProject.unproject()`} />
</div>

<style>
</style>
