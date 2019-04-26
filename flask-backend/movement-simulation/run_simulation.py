"""
Use this script to run prepared simulations for specific locations
"""

LOCATIONS = {
    'PPLACE': [52.509352, 13.375739]
}

OUTBREAK_LOCATION = 'PPLACE'
OUTBREAK_TIME = 0


if __name__ == '__main__':

    from simulation import MovementSimulation

    sim = MovementSimulation()

    outbreak_location = LOCATIONS[OUTBREAK_LOCATION]  # P Place
    outbreak_time = OUTBREAK_TIME

    sim.run_simulation(outbreak_location, outbreak_time)
    sim.save_trajectories(LOCNAME=OUTBREAK_LOCATION)
    breakpoint()
