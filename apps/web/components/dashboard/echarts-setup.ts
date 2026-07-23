import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, GaugeChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";

use([CanvasRenderer, LineChart, GaugeChart, GridComponent, TooltipComponent]);
