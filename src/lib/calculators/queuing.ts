// Queuing Theory calculations

// M/M/1 Queue
export function mm1(lambda: number, mu: number) {
  if (lambda >= mu) throw new Error("System unstable: λ must be < μ");
  const rho = lambda / mu;
  return {
    utilization: rho,
    avgSystemLength: rho / (1 - rho),          // L
    avgQueueLength: rho ** 2 / (1 - rho),       // Lq
    avgSystemTime: 1 / (mu - lambda),           // W
    avgQueueTime: lambda / (mu * (mu - lambda)), // Wq
    probEmpty: 1 - rho,
  };
}

// M/M/c Queue
function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function erlangC(lambda: number, mu: number, c: number): number {
  const rhoServer = lambda / mu;
  const rhoSystem = lambda / (c * mu);
  
  let sumTerm = 0;
  for (let n = 0; n < c; n++) {
    sumTerm += (rhoServer ** n) / factorial(n);
  }
  
  const num = (rhoServer ** c / factorial(c)) * (1 / (1 - rhoSystem));
  return num / (sumTerm + num);
}

export function mmc(lambda: number, mu: number, c: number) {
  if (lambda >= c * mu) throw new Error("System unstable: λ must be < c·μ");
  const rho = lambda / (c * mu);
  const pWait = erlangC(lambda, mu, c);
  const Lq = (pWait * (lambda / mu)) / (1 - rho);
  const Wq = Lq / lambda;
  const L = Lq + lambda / mu;
  const W = L / lambda;
  
  return {
    utilization: rho,
    probWaiting: pWait,
    avgQueueLength: Lq,
    avgQueueTime: Wq,
    avgSystemLength: L,
    avgSystemTime: W,
  };
}
