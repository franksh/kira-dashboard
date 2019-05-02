"""
Use this script to run prepared simulations for specific locations
"""

LOCATIONS = {
    'PPLACE': [52.509352, 13.375739],  # Potsdamer Platz
    'APLACE': [52.521918, 13.413215],  # Alexanderplatz
    'OLYMP': [52.515134, 13.239560],  # Olympiastadium
}

# OUTBREAK_LOCATION = 'PPLACE'
# OUTBREAK_LOCATION = 'APLACE'
OUTBREAK_LOCATION = 'OLYMP'
OUTBREAK_TIME = 0


if __name__ == '__main__':

    from simulation import MovementSimulation

    sim = MovementSimulation()

    outbreak_location = LOCATIONS[OUTBREAK_LOCATION]  # P Place
    outbreak_time = OUTBREAK_TIME

    sim.run_simulation(outbreak_location, outbreak_time)
    sim.save_trajectories(LOCNAME=OUTBREAK_LOCATION)
    breakpoint()
