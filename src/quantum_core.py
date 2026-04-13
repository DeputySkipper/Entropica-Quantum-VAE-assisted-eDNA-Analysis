"""Quantum RNG utilities used by the VAE."""

from __future__ import annotations

import math
import numpy as np
import torch
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

class QuantumRandomGenerator:
    """Generates normal samples from simulated quantum measurements."""
    def __init__(self, num_qubits: int = 10, buffer_size: int = 15000):
        self.num_qubits = num_qubits
        self.simulator = AerSimulator()
        self.max_val = (1 << num_qubits) - 1
        
        self.buffer: list[float] = []
        self.buffer_size = buffer_size
        self._refill_buffer(self.buffer_size)

    def _generate_uniform_batch(self, count: int) -> list[float]:
        qc = QuantumCircuit(self.num_qubits, self.num_qubits)
        qc.h(range(self.num_qubits))
        qc.measure(range(self.num_qubits), range(self.num_qubits))
        
        compiled_circuit = transpile(qc, self.simulator)
        
        job = self.simulator.run(compiled_circuit, shots=count)
        counts = job.result().get_counts(qc)
        
        uniforms = []
        for bitstring, c_count in counts.items():
            val = int(bitstring, 2)
            u = (val + 0.5) / (self.max_val + 1.0)
            uniforms.extend([u] * c_count)
            
        np.random.shuffle(uniforms)
        return uniforms

    def _refill_buffer(self, size: int) -> None:
        need = math.ceil(size / 2.0) * 2
        uniforms = self._generate_uniform_batch(need)
        
        half = need // 2
        u1 = np.array(uniforms[:half])
        u2 = np.array(uniforms[half:])
        
        r = np.sqrt(-2.0 * np.log(u1))
        theta = 2.0 * np.pi * u2
        
        z0 = r * np.cos(theta)
        z1 = r * np.sin(theta)
        
        self.buffer.extend(np.concatenate([z0, z1]).tolist())

    def get_normal_tensor(self, shape: torch.Size | tuple) -> torch.Tensor:
        required_elements = math.prod(shape)
        
        if len(self.buffer) < required_elements:
            self._refill_buffer(max(self.buffer_size, required_elements * 2))
            
        elements = self.buffer[:required_elements]
        self.buffer = self.buffer[required_elements:]
        
        tensor = torch.tensor(elements, dtype=torch.float32)
        return tensor.view(shape)
