# Intralogistics (Warehouse Automation) Example

Complete System-of-Systems architecture example for warehouse automation.

## System-of-Systems Components

- Warehouse Management System (WMS)
- Warehouse Control System (WCS)
- Fleet Control System (FCS) / AGV Controller
- Automated Storage & Retrieval Systems (AS/RS)
- Conveyor Control Systems
- Picking Systems
- Sorting Systems
- Enterprise Resource Planning (ERP)

## Architecture Documentation Strategy

### Business Layer (B1-B2)

```
B1: Intralogistics Automation Portfolio
├─ Order Fulfillment Capability
├─ Inventory Management Capability
├─ Material Flow Optimization Capability
└─ Warehouse Safety Capability

B2: Products
├─ WMS (coordinates overall warehouse operations)
├─ WCS (controls material handling equipment)
├─ AGV Fleet Controller (manages autonomous vehicles)
├─ AS/RS Controller (manages automated storage)
└─ Conveyor Control System (manages conveyor network)

Key Process: Order-to-Shipment
1. Order received in WMS from ERP
2. WMS generates pick tasks
3. WCS allocates tasks to subsystems
4. AGV Controller assigns transport missions
5. AGVs execute material movement
6. Conveyor system routes to packing
7. Status updates flow back to WMS/ERP
```

### Software Layer (S1-S4) - Focus on AGV Fleet Controller

See `references/ArchitectureProcess.md` → Phase 2 for complete metamodel example.

### Physical Layer

See `references/ModelingApproaches.md` → Physical/Technology Domain for deployment example.

### Key Architecture Decisions

See **`software-architecture`** → `assets/architecture-decision-template.md` for solution-level decision documentation (ADR-style).

## Related References

- See `references/ArchitectureProcess.md` for process phases
- See `references/MetamodelDesign.md` for intralogistics domain extensions
- See `Examples/UseCaseExamples.md` → Example 1 for workflow execution
