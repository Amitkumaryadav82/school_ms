package com.school.fee.service;

import com.school.fee.dto.TransportRouteDTO;
import com.school.fee.model.TransportRoute;
import com.school.fee.repository.TransportRouteRepository;
import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransportRouteService {

    private final TransportRouteRepository transportRouteRepository;

    public List<TransportRouteDTO> getAllTransportRoutes() {
        return transportRouteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TransportRouteDTO getTransportRouteById(Long id) {
        TransportRoute route = transportRouteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transport Route not found with id: " + id));
        return convertToDTO(route);
    }

    public TransportRouteDTO getTransportRouteByName(String routeName) {
        TransportRoute route = transportRouteRepository.findByRouteName(routeName)
                .orElseThrow(() -> new EntityNotFoundException("Transport Route not found with name: " + routeName));
        return convertToDTO(route);
    }

    @Transactional
    public TransportRouteDTO createTransportRoute(TransportRouteDTO transportRouteDTO) {
        if (transportRouteRepository.existsByRouteName(transportRouteDTO.getRouteName())) {
            throw new IllegalArgumentException(
                    "Transport Route with name " + transportRouteDTO.getRouteName() + " already exists");
        }

        TransportRoute route = new TransportRoute();
        route.setRouteName(transportRouteDTO.getRouteName());
        route.setRouteDescription(transportRouteDTO.getRouteDescription());
        route.setFeeAmount(transportRouteDTO.getFeeAmount());

        TransportRoute savedRoute = transportRouteRepository.save(route);
        return convertToDTO(savedRoute);
    }

    @Transactional
    public TransportRouteDTO updateTransportRoute(Long id, TransportRouteDTO transportRouteDTO) {
        TransportRoute existingRoute = transportRouteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transport Route not found with id: " + id));

        // Check if trying to update to an existing route name
        if (!existingRoute.getRouteName().equals(transportRouteDTO.getRouteName()) &&
                transportRouteRepository.existsByRouteName(transportRouteDTO.getRouteName())) {
            throw new IllegalArgumentException(
                    "Transport Route with name " + transportRouteDTO.getRouteName() + " already exists");
        }

        existingRoute.setRouteName(transportRouteDTO.getRouteName());
        existingRoute.setRouteDescription(transportRouteDTO.getRouteDescription());
        existingRoute.setFeeAmount(transportRouteDTO.getFeeAmount());

        TransportRoute updatedRoute = transportRouteRepository.save(existingRoute);
        return convertToDTO(updatedRoute);
    }

    @Transactional
    public void deleteTransportRoute(Long id) {
        if (!transportRouteRepository.existsById(id)) {
            throw new EntityNotFoundException("Transport Route not found with id: " + id);
        }
        transportRouteRepository.deleteById(id);
    }

    private TransportRouteDTO convertToDTO(TransportRoute route) {
        return TransportRouteDTO.builder()
                .id(route.getId())
                .routeName(route.getRouteName())
                .routeDescription(route.getRouteDescription())
                .feeAmount(route.getFeeAmount())
                .build();
    }
}

