import * as d3 from 'd3';
import { IOptions } from './interface';
import { Selection } from 'd3-selection';

class Drawer {
  private buffer: AudioBuffer;

  private parent: HTMLElement;
  private getCurrentTime: () => number;
  private seekTo: (time: number) => void;

  constructor(
    buffer: AudioBuffer,
    parent: HTMLElement,
    getCurrentTime: () => number,
    seekTo: (time: number) => void
  ) {
    this.buffer = buffer;
    this.parent = parent;
    this.getCurrentTime = getCurrentTime;
    this.seekTo = seekTo;
  }

  private getTimeDomain() {
    const step = 30; // 30 seconds
    const steps = Math.ceil(this.buffer.duration / step);

    return [...new Array(steps)].map((_, index) => {
      const date = new Date(1970, 0, 1, 0, 0, 0, 0);
      date.setSeconds(index * step);

      let minutes = date.getMinutes().toString();
      if (minutes.length === 1) {
        minutes = `0${minutes}`;
      }

      let seconds = date.getSeconds().toString();
      if (seconds.length === 1) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}`;
    });
  }

  public generateWaveform(audioData: number[], options: IOptions) {
    const {
      margin = { top: 0, bottom: 0, left: 0, right: 0 },
      height = this.parent.clientHeight,
      width = this.parent.clientWidth,
      padding = 1,
    } = options;

    const domain = d3.extent(audioData); // находит минимальное и максимальное значение в audioData

    const xScale = d3
      .scaleLinear() // создаёт линейное масштабирование
      .domain([0, audioData.length - 1]) // задаёт диапазон входных значений
      .range([margin.left, width - margin.right]); // растягивает данные по горизонтали

    const yScale = d3
      .scaleLinear()
      .domain(domain.map((i: string | number) => Number(i)))
      .range([margin.top, height - margin.bottom]); // растягивает данные по вертикали

    const svg = d3
      .create('svg')
      .attr(
        'viewBox',
        `0 -${margin.top + 20} ${width} ${height + margin.top + 20}`
      ) // Добавил верхний отступ
      .style('width', this.parent.clientWidth)
      .style('height', this.parent.clientHeight)
      .style('display', 'block');

    svg // рисуем сетку
      .append('g')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#D6E5D6')
      .call((g: Selection<SVGGElement, unknown, null, undefined>) =>
        g
          .append('g')
          .selectAll('line')
          .data<number>(yScale.ticks())
          .join('line')
          .attr('x1', (d: number) => 0.5 + xScale(d))
          .attr('x2', (d: number) => 0.5 + xScale(d))
          .attr('y1', 0)
          .attr('y2', this.parent.clientHeight)
      )
      .call((g: Selection<SVGGElement, unknown, null, undefined>) =>
        g
          .append('g')
          .selectAll('line')
          .data<number>(yScale.ticks())
          .join('line')
          .attr('y1', (d: number) => yScale(d))
          .attr('y2', (d: number) => yScale(d))
          .attr('x1', 0)
          .attr('x2', this.parent.clientWidth)
      );

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0)');

    const g = svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('fill', '#03A300');

    const band = (width - margin.left - margin.right) / audioData.length;

    g.selectAll('rect') // Рисуем прямоугольники для волны
      .data(audioData) // привязываем данные audioData
      .join('rect')
      .attr('fill', '#03A300')
      .attr('height', (d: number) => yScale(d))
      .attr('width', () => band * padding)
      .attr('x', (_: unknown, i: number) => xScale(i))
      .attr('y', (d: number) => -yScale(d) / 2)
      .attr('rx', band / 2)
      .attr('ry', band / 2);

    const bands = this.getTimeDomain();

    const bandScale = d3
      .scaleBand() // создаёт шкалу времени
      .domain(bands)
      .range([margin.top, this.parent.clientWidth]);

    svg
      .append('g')
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .call((g: Selection<SVGGElement, unknown, null, undefined>) =>
        g.select('.domain').remove()
      )
      .attr('stroke-width', 0)
      .style('color', '#95A17D')
      .style('font-size', 11)
      .style('font-wight', 400)
      .call(d3.axisBottom(bandScale.copy()));

    const cursorGroup = svg.append('g'); // Группа для курсора и треугольника

    const cursor = cursorGroup
      .append('line') // Линия курсора
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'gray')
      .attr('stroke-width', 2)
      .style('pointer-events', 'all')
      .style('cursor', 'grabbing');

    const triangleSize = 10;

    const triangle = cursorGroup.append('polygon').attr('fill', 'gray');

    const updateCursor = () => {
      const currentTime = this.getCurrentTime();
      const position = xScale(
        (currentTime / this.buffer.duration) * audioData.length
      );

      cursor.attr('x1', position).attr('x2', position);

      triangle.attr(
        'points',
        `
            ${position - triangleSize},${-triangleSize * 1.5}  
            ${position + triangleSize},${-triangleSize * 1.5}  
            ${position},${-triangleSize * 0.5}  
          `
      );
    };

    let isDragging = false;

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const rect = this.parent.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = (x / width) * this.buffer.duration;
      this.seekTo(time);
    };

    const onMouseDown = () => {
      isDragging = true;
      this.parent.style.cursor = 'grabbing';
    };

    const onMouseUp = () => {
      isDragging = false;
      this.parent.style.cursor = 'default';
    };

    svg.on('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    updateCursor();
    setInterval(updateCursor, 1000);

    return svg;
  }

  public clearData() {
    const rawData = this.buffer.getChannelData(0); // We only need to work with one channel of data
    const samples = this.buffer.sampleRate; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i += 1) {
      const blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j += 1) {
        sum += Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    const multiplier = Math.max(...filteredData) ** -1;
    return filteredData.map(n => n * multiplier);
  }

  public init() {
    const audioData = this.clearData();
    const node = this.generateWaveform(audioData, {});
    this.parent.appendChild(node.node() as Element); // .node преобразует D3-объект в обычный DOM-элемент
  }
}

export default Drawer;
