export class ACOOptimizer {
  constructor(distanceMatrix, params) {
    this.distances = distanceMatrix;
    this.n = distanceMatrix.length;
    this.nAnts = params.nAnts;
    this.nIter = params.nIter;
    this.alpha = params.alpha;
    this.beta = params.beta;
    this.rho = params.rho;
    this.Q = params.Q;

    this.pheromone = Array.from({ length: this.n }, () =>
      Array(this.n).fill(1.0)
    );
    this.bestTour = null;
    this.bestLength = Infinity;
    this.history = [];
  }

  runIteration() {
    const ants = [];
    for (let k = 0; k < this.nAnts; k++) {
      const tour = this.constructTour();
      const length = this.tourLength(tour);
      ants.push({ tour, length });
      if (length < this.bestLength) {
        this.bestLength = length;
        this.bestTour = [...tour];
      }
    }

    this.updatePheromones(ants);
    this.history.push(this.bestLength);
    return { bestTour: this.bestTour, bestLength: this.bestLength };
  }

  constructTour() {
    const tour = [0];
    const visited = new Set([0]);

    while (tour.length < this.n) {
      const current = tour[tour.length - 1];
      const probs = [];
      let total = 0;

      for (let j = 0; j < this.n; j++) {
        if (!visited.has(j) && this.distances[current][j] > 0) {
          const tau = Math.pow(this.pheromone[current][j], this.alpha);
          const eta = Math.pow(1.0 / this.distances[current][j], this.beta);
          const prob = tau * eta;
          probs.push({ node: j, prob });
          total += prob;
        }
      }

      if (probs.length === 0) break;

      const rand = Math.random() * total;
      let cumsum = 0;
      let selected = probs[0].node;
      for (const p of probs) {
        cumsum += p.prob;
        if (cumsum >= rand) {
          selected = p.node;
          break;
        }
      }

      tour.push(selected);
      visited.add(selected);
    }

    tour.push(0);
    return tour;
  }

  tourLength(tour) {
    let len = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      len += this.distances[tour[i]][tour[i + 1]];
    }
    return len;
  }

  updatePheromones(ants) {
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        this.pheromone[i][j] *= (1 - this.rho);
      }
    }

    for (const ant of ants) {
      const deposit = this.Q / ant.length;
      for (let i = 0; i < ant.tour.length - 1; i++) {
        const from = ant.tour[i];
        const to = ant.tour[i + 1];
        this.pheromone[from][to] += deposit;
        this.pheromone[to][from] += deposit;
      }
    }
  }

  checkConvergence(stagnationLimit = 10) {
    if (this.history.length < stagnationLimit) return false;
    const recent = this.history.slice(-stagnationLimit);
    return recent.every(v => v === recent[0]);
  }
}
